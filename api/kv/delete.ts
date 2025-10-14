import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kvDelete } from '../../app/lib/db';

/**
 * POST /api/kv/delete
 * Delete a key from the store
 * Body: { key: string }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { key } = req.body;

        if (!key || typeof key !== 'string') {
            return res.status(400).json({ error: 'Key is required' });
        }

        // TODO: Get userId from session cookie when auth is implemented
        const userId = undefined;

        await kvDelete(key, userId);

        return res.status(200).json({ success: true, key });
    } catch (error) {
        console.error('KV delete error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
