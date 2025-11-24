import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthenticatedUser } from '../../app/lib/auth';

/**
 * GET /api/auth/status
 * Check authentication status and return user info
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const user = await getAuthenticatedUser(req);

        if (!user) {
            return res.status(200).json({
                isAuthenticated: false,
                user: null,
            });
        }

        return res.status(200).json({
            isAuthenticated: true,
            user: {
                uuid: user.uuid,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error('Status check error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
