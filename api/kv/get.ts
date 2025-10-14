import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kvGet } from '../../app/lib/db';
import { getAuthenticatedUser } from '../../app/lib/auth';

/**
 * GET /api/kv/get?key=<key>
 * Get a value from the key-value store
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { key } = req.query;

        if (!key || typeof key !== 'string') {
            return res.status(400).json({ error: 'Key is required' });
        }

        // Get authenticated user (optional - KV can work without auth)
        const user = await getAuthenticatedUser(req);
        const userId = user?.id;

        const value = await kvGet(key, userId);

        if (value === null) {
            return res.status(404).json({ error: 'Key not found', value: null });
        }

        return res.status(200).json({ key, value });
    } catch (error) {
        console.error('KV get error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
