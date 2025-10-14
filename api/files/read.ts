import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../../app/lib/auth';
import { readFile, getFileMetadata } from '../../app/lib/storage';

/**
 * GET /api/files/read?path=<file_path>
 * Read a file from Google Cloud Storage
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Require authentication
        const user = await requireAuth(req, res);
        if (!user) return;

        const { path } = req.query;

        if (!path || typeof path !== 'string') {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Path parameter is required',
            });
        }

        // Security: Ensure user can only access their own files
        const userPrefix = `users/${user.id}/`;
        if (!path.startsWith(userPrefix)) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You can only access your own files',
            });
        }

        // Get file metadata for content type
        const metadata = await getFileMetadata(path);
        
        if (!metadata) {
            return res.status(404).json({
                error: 'Not found',
                message: 'File not found',
            });
        }

        // Read file from GCS
        const fileBuffer = await readFile(path);

        // Set appropriate headers
        res.setHeader('Content-Type', metadata.contentType);
        res.setHeader('Content-Length', metadata.size.toString());
        res.setHeader('Content-Disposition', `inline; filename="${metadata.name}"`);

        return res.status(200).send(fileBuffer);
    } catch (error) {
        console.error('Read file error:', error);
        
        if (error instanceof Error && error.message === 'File not found') {
            return res.status(404).json({
                error: 'Not found',
                message: 'File not found',
            });
        }

        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
