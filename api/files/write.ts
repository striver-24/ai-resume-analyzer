import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../../app/lib/auth';
import { uploadFile } from '../../app/lib/storage';

/**
 * POST /api/files/write
 * Write/update a file in Google Cloud Storage
 * Body: { path: string, file?: File, content?: string }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Require authentication
        const user = await requireAuth(req, res);
        if (!user) return;

        const { path, content, file } = req.body;

        if (!path || typeof path !== 'string') {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Path is required',
            });
        }

        // Security: Ensure user can only write to their own files
        const userPrefix = `users/${user.id}/`;
        if (!path.startsWith(userPrefix)) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You can only write to your own files',
            });
        }

        let fileBuffer: Buffer;
        let contentType = 'text/plain';
        let fileName = path.split('/').pop() || 'file';

        if (file) {
            // File upload
            fileBuffer = Buffer.from(file.buffer || file);
            contentType = file.type || file.mimetype || 'application/octet-stream';
            fileName = file.name || file.originalname || fileName;
        } else if (content) {
            // Text content
            fileBuffer = Buffer.from(content, 'utf-8');
        } else {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Either file or content is required',
            });
        }

        // Upload/overwrite file
        const uploadedFile = await uploadFile(
            fileBuffer,
            fileName,
            contentType,
            user.id
        );

        return res.status(200).json({
            success: true,
            file: {
                id: uploadedFile.id,
                name: uploadedFile.name,
                path: uploadedFile.path,
                size: uploadedFile.size,
            },
        });
    } catch (error) {
        console.error('Write file error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
