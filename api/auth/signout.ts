import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
    getSessionToken,
    destroySession,
    clearSessionCookie,
} from '../../app/lib/auth';

/**
 * POST /api/auth/signout
 * Sign out and destroy session
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const sessionToken = getSessionToken(req);

        if (sessionToken) {
            // Destroy session in database
            await destroySession(sessionToken);
        }

        // Clear session cookie
        clearSessionCookie(res);

        return res.status(200).json({
            success: true,
            message: 'Signed out successfully',
        });
    } catch (error) {
        console.error('Sign-out error:', error);
        
        // Still clear the cookie even if database operation fails
        clearSessionCookie(res);
        
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
