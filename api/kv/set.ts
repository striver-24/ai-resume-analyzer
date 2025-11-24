import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kvSet } from '../../app/lib/db';
import { getAuthenticatedUser } from '../../app/lib/auth';

/**
 * POST /api/kv/set
 * Set a key-value pair in the store
 * Body: { key: string, value: string }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { key, value } = req.body;

        if (!key || typeof key !== 'string') {
            return res.status(400).json({ error: 'Key is required' });
        }

        if (value === undefined || value === null) {
            return res.status(400).json({ error: 'Value is required' });
        }

        // Convert value to string if it isn't already
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

        // Get authenticated user (optional - KV can work without auth)
        const user = await getAuthenticatedUser(req);
        const userId = user?.id;

        await kvSet(key, stringValue, userId);

        return res.status(200).json({ success: true, key });
    } catch (error) {
        console.error('KV set error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
