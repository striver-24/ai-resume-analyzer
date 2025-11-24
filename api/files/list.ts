import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../../app/lib/auth';
import { listFiles } from '../../app/lib/storage';

/**
 * GET /api/files/list?path=<folder_path>
 * List files in a folder from Google Cloud Storage
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
        const folderPath = path && typeof path === 'string' ? path : '';

        // Security: Ensure user can only list their own files
        if (folderPath) {
            const userPrefix = `users/${user.id}/`;
            if (!folderPath.startsWith(userPrefix)) {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'You can only list your own files',
                });
            }
        }

        // List files from GCS
        const files = await listFiles(user.id, folderPath);

        // Format file list response
        const formattedFiles = files.map(file => ({
            id: file.id,
            uid: file.id,
            name: file.name,
            path: file.path,
            is_dir: false,
            size: file.size,
            created: file.created.getTime(),
            modified: file.updated.getTime(),
            accessed: file.updated.getTime(),
            writable: true,
            parent_id: null,
            parent_uid: null,
        }));

        return res.status(200).json(formattedFiles);
    } catch (error) {
        console.error('List files error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
