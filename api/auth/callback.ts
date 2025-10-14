import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
    getGoogleUserInfo,
    createUserSession,
    setSessionCookie,
    verifyStateToken,
} from '../../app/lib/auth';

/**
 * GET /api/auth/callback?code=<auth_code>&state=<state_token>
 * Handle Google OAuth callback
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { code, state, error } = req.query;

        // Handle OAuth errors
        if (error) {
            console.error('OAuth error:', error);
            return res.redirect(`/?error=${encodeURIComponent(error as string)}`);
        }

        // Validate required parameters
        if (!code || typeof code !== 'string') {
            return res.redirect('/?error=missing_code');
        }

        if (!state || typeof state !== 'string') {
            return res.redirect('/?error=missing_state');
        }

        // Verify state token
        const stateData = verifyStateToken(state);
        if (!stateData) {
            return res.redirect('/?error=invalid_state');
        }

        // Exchange code for user info
        const googleUser = await getGoogleUserInfo(code);

        if (!googleUser.id || !googleUser.email) {
            return res.redirect('/?error=invalid_user_data');
        }

        // Create user session
        const { sessionToken, user } = await createUserSession(
            googleUser.id,
            googleUser.name,
            googleUser.email
        );

        // Set session cookie
        setSessionCookie(res, sessionToken);

        // Redirect to original destination or home
        const redirectTo = stateData.redirectTo || '/';
        return res.redirect(302, redirectTo);
    } catch (error) {
        console.error('Callback error:', error);
        const errorMessage = error instanceof Error ? error.message : 'auth_failed';
        return res.redirect(`/?error=${encodeURIComponent(errorMessage)}`);
    }
}
