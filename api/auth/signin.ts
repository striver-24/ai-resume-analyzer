import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGoogleAuthUrl, generateStateToken } from '../../app/lib/auth';

/**
 * GET /api/auth/signin?next=<redirect_path>
 * Initiate Google OAuth sign-in flow
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get redirect path from query
        const next = (req.query.next as string) || '/';

        // Generate state token with redirect info
        const state = generateStateToken(next);

        // Get Google OAuth URL
        const authUrl = getGoogleAuthUrl(state);

        // Redirect to Google OAuth
        return res.redirect(302, authUrl);
    } catch (error) {
        console.error('Sign-in error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
