import type { VercelRequest, VercelResponse } from '@vercel/node';
import busboy from 'busboy';
import { Readable } from 'stream';
import { requireAuth } from '../../app/lib/auth';
import { uploadFile } from '../../app/lib/storage';
import { createResume } from '../../app/lib/db';

interface FileUpload {
    buffer: Buffer;
    filename: string;
    mimeType: string;
}

/**
 * POST /api/files/upload
 * Upload one or more files to Google Cloud Storage
 * Multipart form data with 'files' field
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Require authentication
        const user = await requireAuth(req, res);
        if (!user) return; // requireAuth already sent response

        // Parse multipart form data
        const contentType = req.headers['content-type'] || '';
        
        if (!contentType.includes('multipart/form-data')) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Content-Type must be multipart/form-data',
            });
        }

        const files: FileUpload[] = [];
        
        // Get raw body as buffer
        let rawBody: Buffer;
        
        console.log('Request body type:', typeof req.body);
        console.log('Request body is Buffer:', Buffer.isBuffer(req.body));
        console.log('Request has .on method:', typeof (req as any).on === 'function');
        
        if (req.body && Buffer.isBuffer(req.body)) {
            // Body is already a buffer (production/Vercel)
            console.log('Using body as buffer, length:', req.body.length);
            rawBody = req.body;
        } else if (req.body && typeof req.body === 'string') {
            // Body is a string
            console.log('Converting string body to buffer, length:', req.body.length);
            rawBody = Buffer.from(req.body);
        } else if (typeof (req as any).on === 'function') {
            // Request is a readable stream (Node.js)
            console.log('Reading from request stream...');
            const chunks: Buffer[] = [];
            await new Promise<void>((resolve, reject) => {
                (req as any).on('data', (chunk: Buffer) => {
                    console.log('Received chunk, size:', chunk.length);
                    chunks.push(chunk);
                });
                (req as any).on('end', () => {
                    console.log('Stream ended, total chunks:', chunks.length);
                    resolve();
                });
                (req as any).on('error', reject);
            });
            rawBody = Buffer.concat(chunks);
            console.log('Total raw body size:', rawBody.length);
        } else {
            // Fallback: try to get from body
            console.log('Using fallback, body:', req.body);
            rawBody = Buffer.from(JSON.stringify(req.body || ''));
        }

        console.log('Starting busboy parsing, raw body length:', rawBody.length);

        // Parse multipart data using busboy
        await new Promise<void>((resolve, reject) => {
            const bb = busboy({ headers: req.headers as busboy.BusboyConfig['headers'] });

            bb.on('file', (fieldname: string, file: NodeJS.ReadableStream, info: busboy.FileInfo) => {
                console.log('Busboy received file:', fieldname, info);
                const { filename, encoding, mimeType } = info;
                const fileChunks: Buffer[] = [];
                
                file.on('data', (data: Buffer) => {
                    fileChunks.push(data);
                });

                file.on('end', () => {
                    const totalSize = Buffer.concat(fileChunks).length;
                    console.log('File data received, total size:', totalSize);
                    files.push({
                        buffer: Buffer.concat(fileChunks),
                        filename: filename || 'unnamed',
                        mimeType: mimeType || 'application/octet-stream',
                    });
                });

                file.on('error', reject);
            });

            bb.on('finish', () => {
                console.log('Busboy finished parsing. Total files:', files.length);
                resolve();
            });

            bb.on('error', (error: Error) => {
                console.error('Busboy error:', error);
                reject(error);
            });

            // Feed the raw body to busboy
            bb.end(rawBody);
        });

        console.log('Files parsed:', files.length);

        if (files.length === 0) {
            console.error('No files found in the request');
            return res.status(400).json({
                error: 'Bad request',
                message: 'No files provided',
            });
        }

        // Upload file(s) to GCS
        const uploadedFiles = [];

        for (const file of files) {
            const uploadedFile = await uploadFile(
                file.buffer,
                file.filename,
                file.mimeType,
                user.id,
                'resumes'
            );

            // Store metadata in database
            const resumeRecord = await createResume({
                userId: user.id,
                fileName: uploadedFile.name,
                filePath: uploadedFile.path,
                fileSize: uploadedFile.size,
                mimeType: uploadedFile.contentType,
                gcsUrl: uploadedFile.url,
            });

            uploadedFiles.push({
                id: resumeRecord.id,
                uid: resumeRecord.id,
                name: uploadedFile.name,
                path: uploadedFile.path,
                size: uploadedFile.size,
                is_dir: false,
                created: uploadedFile.created.getTime(),
                modified: uploadedFile.updated.getTime(),
            });
        }

        // Return file metadata response
        return res.status(200).json(uploadedFiles.length === 1 ? uploadedFiles[0] : uploadedFiles);
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

// Disable body parsing to allow raw body access
export const config = {
    api: {
        bodyParser: false,
    },
};
