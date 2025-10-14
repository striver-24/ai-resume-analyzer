import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kvList } from '../../app/lib/db';

/**
 * GET /api/kv/list?pattern=<pattern>&values=<boolean>
 * List keys matching a pattern from the store
 * Pattern supports wildcards (*)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { pattern, values } = req.query;

        if (!pattern || typeof pattern !== 'string') {
            return res.status(400).json({ error: 'Pattern is required' });
        }

        const returnValues = values === 'true' || values === '1';

        // TODO: Get userId from session cookie when auth is implemented
        const userId = undefined;

        const result = await kvList(pattern, returnValues, userId);

        return res.status(200).json({ 
            pattern,
            count: result.length,
            items: result 
        });
    } catch (error) {
        console.error('KV list error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
