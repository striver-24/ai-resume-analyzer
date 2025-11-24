import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../../app/lib/auth';
import { deleteFile } from '../../app/lib/storage';
import { deleteResume } from '../../app/lib/db';

/**
 * POST /api/files/delete
 * Delete a file from Google Cloud Storage
 * Body: { path: string }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Require authentication
        const user = await requireAuth(req, res);
        if (!user) return;

        const { path } = req.body;

        if (!path || typeof path !== 'string') {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Path is required',
            });
        }

        // Security: Ensure user can only delete their own files
        const userPrefix = `users/${user.id}/`;
        if (!path.startsWith(userPrefix)) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You can only delete your own files',
            });
        }

        // Delete from GCS
        await deleteFile(path);

        // Also delete from database if it's a resume
        // This is a best-effort operation - we don't fail if it doesn't exist in DB
        try {
            // Extract file ID from path if possible
            const fileId = path.split('/').pop()?.split('.')[0];
            if (fileId) {
                await deleteResume(fileId);
            }
        } catch (dbError) {
            // Log but don't fail
            console.warn('Failed to delete from database:', dbError);
        }

        return res.status(200).json({
            success: true,
            message: 'File deleted successfully',
        });
    } catch (error) {
        console.error('Delete file error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
