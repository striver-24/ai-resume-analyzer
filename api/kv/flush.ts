import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kvFlush } from '../../app/lib/db';

/**
 * POST /api/kv/flush
 * Delete all keys from the store (for current user scope)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // TODO: Get userId from session cookie when auth is implemented
        const userId = undefined;

        await kvFlush(userId);

        return res.status(200).json({ success: true, message: 'All keys flushed' });
    } catch (error) {
        console.error('KV flush error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
