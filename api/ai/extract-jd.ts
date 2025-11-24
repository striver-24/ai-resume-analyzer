import type { VercelRequest, VercelResponse } from '@vercel/node';
import busboy from 'busboy';
import { Readable } from 'stream';
import { requireAuth } from '../../app/lib/auth';
import { generateContent } from '../../app/lib/ai';
import { uploadFile } from '../../app/lib/storage';
import { extractTextFromPDF, extractTextFromDOCX } from '../../app/lib/file-extraction';

interface FileUpload {
    buffer: Buffer;
    filename: string;
    mimeType: string;
}

/**
 * POST /api/ai/extract-jd
 * 
 * Extract Job Title, Company Name, and Job Description from uploaded file
 * Also handles conversion to image for visualization
 * 
 * Request: Multipart form data with 'file' field
 * 
 * Response:
 * {
 *   "success": true,
 *   "jobTitle": "Senior Software Engineer",
 *   "companyName": "TechCorp",
 *   "jobDescription": "Full job description text",
 *   "filePath": "path/in/gcs",
 *   "imagePath": "path/to/image/in/gcs"
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
        if (!user) return; // requireAuth already sent response

        // Parse multipart form data
        const contentType = req.headers['content-type'] || '';
        if (!contentType.includes('multipart/form-data')) {
            return res.status(400).json({
                success: false,
                error: 'Content-Type must be multipart/form-data',
            });
        }

        const files: FileUpload[] = [];
        
        // Get raw body as buffer
        let rawBody: Buffer;
        
        if (req.body && Buffer.isBuffer(req.body)) {
            // Body is already a buffer (production/Vercel)
            rawBody = req.body;
        } else if (req.body && typeof req.body === 'string') {
            // Body is a string
            rawBody = Buffer.from(req.body);
        } else if (typeof (req as any).on === 'function') {
            // Request is a readable stream (Node.js)
            const chunks: Buffer[] = [];
            await new Promise<void>((resolve, reject) => {
                (req as any).on('data', (chunk: Buffer) => {
                    chunks.push(chunk);
                });
                (req as any).on('end', () => {
                    resolve();
                });
                (req as any).on('error', reject);
            });
            rawBody = Buffer.concat(chunks);
        } else {
            // Fallback
            rawBody = Buffer.from(JSON.stringify(req.body || ''));
        }

        // Parse with busboy
        const bb = busboy({
            headers: req.headers,
            limits: {
                fileSize: 20 * 1024 * 1024, // 20MB
                files: 1,
            },
        });

        const errors: string[] = [];

        bb.on('file', (fieldname, file, info) => {
            if (fieldname !== 'file') {
                file.resume();
                return;
            }

            const chunks: Buffer[] = [];

            file.on('data', (data) => {
                chunks.push(data);
            });

            file.on('end', () => {
                files.push({
                    buffer: Buffer.concat(chunks),
                    filename: info.filename,
                    mimeType: info.mimeType,
                });
            });

            file.on('error', (err: unknown) => {
                errors.push(`File upload error: ${err instanceof Error ? err.message : String(err)}`);
            });
        });

        bb.on('error', (err: unknown) => {
            errors.push(`Parse error: ${err instanceof Error ? err.message : String(err)}`);
        });

        // Wait for busboy to finish
        await new Promise<void>((resolve, reject) => {
            bb.on('close', () => resolve());
            bb.on('error', reject);

            // Write the raw body to busboy
            bb.write(rawBody);
            bb.end();
        });

        // Check for errors
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                error: errors.join('; '),
            });
        }

        // Validate file was provided
        if (files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No file provided',
            });
        }

        const jdFile = files[0];
        const fileExt = jdFile.filename.split('.').pop()?.toLowerCase();
        const isPDF = fileExt === 'pdf' || jdFile.mimeType === 'application/pdf';
        let imagePath: string | null = null;

        console.log(`📄 Processing JD file: ${jdFile.filename} (${jdFile.mimeType})`);

        try {
            // Step 1: Extract text from the file
            console.log('📝 Extracting text from JD file...');
            let jdText: string;

            if (isPDF) {
                // For PDF: use PDF text extraction
                console.log('📄 Extracting text from PDF...');
                jdText = await extractTextFromPDF(jdFile.buffer);
            } else {
                // For DOCX or other text-based files
                console.log('📋 Extracting text from DOCX...');
                jdText = extractTextFromDOCX(jdFile.buffer);
            }

            console.log(`✅ Text extracted. Length: ${jdText.length} characters`);

            // Validate extracted text
            if (!jdText || jdText.trim().length === 0) {
                throw new Error('Could not extract text from the uploaded file. Please ensure the file contains readable text.');
            }

            // Sanitize the text - remove excessive whitespace and binary artifacts
            let sanitizedText = jdText
                .replace(/\s+/g, ' ') // Collapse multiple spaces
                .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters except \n \r \t
                .trim();

            if (sanitizedText.length < 50) {
                throw new Error('Extracted text is too short. Please check if the file contains valid job description text.');
            }

            // Truncate if too long (max 8000 chars to avoid token limits)
            if (sanitizedText.length > 8000) {
                console.log(`⚠️ Text is very long (${sanitizedText.length} chars), truncating to 8000 chars`);
                sanitizedText = sanitizedText.substring(0, 8000) + '...';
            }

            console.log(`✅ Text sanitized. Final length: ${sanitizedText.length} characters`);

            // Step 2: Upload the original JD file to GCS
            console.log('☁️ Uploading JD file to cloud storage...');
            const uploadedFile = await uploadFile(
                jdFile.buffer,
                jdFile.filename,
                jdFile.mimeType,
                user.id,
                'job_descriptions'
            );

            console.log(`✅ File uploaded to: ${uploadedFile.path}`);

            // Step 3: Use AI to extract structured information from the JD text
            console.log('🤖 Extracting structured JD information with AI...');
            const extractionPrompt = `You are a job description analyzer. Extract the following information from this Job Description and return ONLY a valid JSON object:

1. jobTitle: The job position title (string, required)
2. companyName: The company name or "Not specified" if not found (string)
3. jobDescription: The complete job description text as provided (string, required)

IMPORTANT:
- Return ONLY valid JSON, no markdown, no explanations
- The JSON must be valid and parseable
- Keep jobDescription as the original text provided
- Do NOT include any text before or after the JSON
- Do NOT use code blocks (no \`\`\`json)

Job Description Text:
${sanitizedText}

Return the JSON object now:`;

            const extractionResponse = await generateContent(extractionPrompt, {
                temperature: 0.1, // Low temperature for consistent extraction
                maxTokens: 2000,
            });

            console.log('🔍 Parsing AI extraction response...');
            console.log(`Response preview: ${extractionResponse.substring(0, 200)}...`);

            // Parse the JSON response
            let extractedData: {
                jobTitle: string;
                companyName: string;
                jobDescription: string;
            };

            try {
                // Clean the response - remove markdown code blocks and extra whitespace
                let cleaned = extractionResponse.trim();
                
                // Remove markdown code block markers
                cleaned = cleaned.replace(/^```(?:json|JSON)?\s*[\r\n]*/i, '');
                cleaned = cleaned.replace(/[\r\n]*```\s*$/i, '');
                cleaned = cleaned.trim();
                
                // Try to find JSON object if response has extra text
                const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    cleaned = jsonMatch[0];
                }

                console.log(`Cleaned response: ${cleaned.substring(0, 150)}...`);

                extractedData = JSON.parse(cleaned);

                // Validate required fields
                if (!extractedData.jobTitle || typeof extractedData.jobTitle !== 'string') {
                    extractedData.jobTitle = 'Not specified';
                }
                if (!extractedData.jobDescription || typeof extractedData.jobDescription !== 'string') {
                    throw new Error('Missing job description in extraction response');
                }
                if (!extractedData.companyName || typeof extractedData.companyName !== 'string') {
                    extractedData.companyName = 'Not specified';
                }

                // Clean up the extracted strings
                extractedData.jobTitle = extractedData.jobTitle.trim().substring(0, 200);
                extractedData.companyName = extractedData.companyName.trim().substring(0, 200);
                extractedData.jobDescription = extractedData.jobDescription.trim();

            } catch (parseError) {
                console.error('❌ Failed to parse extraction response:');
                console.error('Raw response:', extractionResponse.substring(0, 500));
                console.error('Parse error:', parseError);
                throw new Error(
                    `Failed to parse AI extraction: ${parseError instanceof Error ? parseError.message : 'Invalid JSON'}`
                );
            }

            console.log('✅ JD extracted successfully');
            console.log('Extracted data:', {
                jobTitle: extractedData.jobTitle,
                companyName: extractedData.companyName,
                descriptionLength: extractedData.jobDescription.length,
            });

            // Return success response
            return res.status(200).json({
                success: true,
                jobTitle: extractedData.jobTitle,
                companyName: extractedData.companyName,
                jobDescription: extractedData.jobDescription,
                filePath: uploadedFile.path,
                imagePath: imagePath || uploadedFile.path, // Fall back to original path if no image
            });
        } catch (processingError) {
            console.error('❌ JD processing error:', processingError);
            throw processingError;
        }
    } catch (error) {
        console.error('Extract JD error:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to extract JD information',
        });
    }
}
