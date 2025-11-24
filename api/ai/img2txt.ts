import type { VercelRequest, VercelResponse } from '@vercel/node';
import busboy from 'busboy';
import { extractTextFromFile, extractTextFromImage } from '../../app/lib/ai';
import { requireAuth } from '../../app/lib/auth';
import { readFile } from '../../app/lib/storage';

/**
 * POST /api/ai/img2txt
 * 
 * Extract text from resume images or PDFs using OCR
 * 
 * Request: Multipart form data with 'image' field
 * OR JSON body with:
 * {
 *   "filePath": "path/to/resume.pdf",    // Optional if imageData provided
 *   "imageData": "base64-encoded-image"  // Optional if filePath provided
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "text": "Extracted resume text..."
 * }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed',
        });
    }

    try {
        // Require authentication
        const user = await requireAuth(req, res);

        const contentType = req.headers['content-type'] || '';
        
        // Handle multipart form data
        if (contentType.includes('multipart/form-data')) {
            // Get raw body as buffer
            let rawBody: Buffer;
            
            if (req.body && Buffer.isBuffer(req.body)) {
                // Body is already a Buffer (from Vite middleware)
                rawBody = req.body;
                console.log('Using body as Buffer directly');
            } else if (req.body && typeof req.body === 'string') {
                // CRITICAL: Use 'latin1' encoding to preserve binary data
                // UTF-8 encoding will corrupt binary data by replacing invalid sequences
                rawBody = Buffer.from(req.body, 'latin1');
                console.log('Converted string body to buffer with latin1 encoding');
            } else if (typeof (req as any).on === 'function') {
                const chunks: Buffer[] = [];
                await new Promise<void>((resolve, reject) => {
                    (req as any).on('data', (chunk: Buffer) => chunks.push(chunk));
                    (req as any).on('end', () => resolve());
                    (req as any).on('error', reject);
                });
                rawBody = Buffer.concat(chunks);
                console.log('Read body from request stream');
            } else {
                rawBody = Buffer.from(JSON.stringify(req.body || ''));
                console.log('Created buffer from JSON body');
            }

            console.log('Raw body stats:', {
                length: rawBody.length,
                firstBytes: rawBody.subarray(0, 16).toString('hex'),
            });

            // Parse multipart data
            let imageBuffer: Buffer | null = null;
            let imageUrl: string | null = null;
            
            await new Promise<void>((resolve, reject) => {
                const bb = busboy({ headers: req.headers as busboy.BusboyConfig['headers'] });

                bb.on('file', (fieldname: string, file: NodeJS.ReadableStream, info: busboy.FileInfo) => {
                    const chunks: Buffer[] = [];
                    
                    file.on('data', (data: Buffer) => {
                        chunks.push(data);
                    });

                    file.on('end', () => {
                        imageBuffer = Buffer.concat(chunks);
                        console.log('Image buffer received:', {
                            fieldname,
                            filename: info.filename,
                            mimeType: info.mimeType,
                            bufferLength: imageBuffer.length,
                            firstBytes: imageBuffer.subarray(0, 16).toString('hex'),
                        });
                    });

                    file.on('error', reject);
                });

                bb.on('field', (fieldname: string, val: string) => {
                    if (fieldname === 'imageUrl') {
                        imageUrl = val;
                    }
                });

                bb.on('finish', () => {
                    resolve();
                });

                bb.on('error', reject);

                bb.end(rawBody);
            });

            // Check if we have image data (either file or URL path)
            if (!imageBuffer && !imageUrl) {
                return res.status(400).json({
                    success: false,
                    error: 'No image provided in multipart data',
                });
            }

            let extractedText: string;

            if (imageBuffer) {
                // Extract text from uploaded image buffer
                console.log('🖼️ Extracting text from image buffer');
                extractedText = await extractTextFromImage(imageBuffer);
            } else if (imageUrl) {
                // Extract text from file path (GCS)
                console.log('📂 Extracting text from file path:', imageUrl);
                extractedText = await extractTextFromFile(imageUrl);
            } else {
                return res.status(400).json({
                    success: false,
                    error: 'No valid image data provided',
                });
            }

            return res.status(200).json({
                success: true,
                text: extractedText,
            });
        }

        // Handle JSON body (legacy format)
        const { filePath, imageData } = req.body;

        // Need either filePath or imageData
        if (!filePath && !imageData) {
            return res.status(400).json({
                success: false,
                error: 'Either filePath or imageData is required',
            });
        }

        let extractedText: string;

        if (filePath) {
            // Extract from file path (GCS)
            try {
                extractedText = await extractTextFromFile(filePath);
            } catch (error) {
                console.error('File text extraction error:', error);
                return res.status(400).json({
                    success: false,
                    error: 'Failed to extract text from file',
                });
            }
        } else {
            // Extract from base64 image data
            try {
                // Decode base64
                const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
                const imageBuffer = Buffer.from(base64Data, 'base64');
                extractedText = await extractTextFromImage(imageBuffer);
            } catch (error) {
                console.error('Image text extraction error:', error);
                return res.status(400).json({
                    success: false,
                    error: 'Failed to extract text from image',
                });
            }
        }

        // Validate extracted text
        if (!extractedText || extractedText.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No text could be extracted from the image',
            });
        }

        return res.status(200).json({
            success: true,
            text: extractedText,
        });
    } catch (error) {
        console.error('OCR error:', error);
        console.error('Error details:', {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            contentType: req.headers['content-type'],
        });

        // Handle specific errors
        if (error instanceof Error) {
            if (error.message.includes('not initialized')) {
                return res.status(503).json({
                    success: false,
                    error: 'AI service is not available',
                    details: error.message,
                });
            }
            if (error.message.includes('Vertex AI') || error.message.includes('authentication')) {
                return res.status(503).json({
                    success: false,
                    error: 'AI service configuration error',
                    details: error.message,
                });
            }
        }

        return res.status(500).json({
            success: false,
            error: 'Failed to extract text from image',
            details: error instanceof Error ? error.message : String(error),
        });
    }
}

// Disable body parsing to allow raw body access for multipart
export const config = {
    api: {
        bodyParser: false,
    },
};
