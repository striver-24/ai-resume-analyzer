import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../../app/lib/auth';
import { convertResumeToMarkdown } from '../../app/lib/ai';

/**
 * POST /api/ai/convert-to-markdown
 * 
 * Convert resume text to markdown format
 * 
 * Request body:
 * {
 *   "resumeText": "Resume content as plain text..."
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "markdown": "---\nname: John Doe\n...",
 * }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed',
        });
    }

    try {
        // Require authentication
        const user = await requireAuth(req, res);
        if (!user) return;

        const { resumeText } = req.body;

        if (!resumeText || typeof resumeText !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'resumeText is required',
            });
        }

        // Convert to markdown
        console.log('Converting resume to markdown...');
        const markdown = await convertResumeToMarkdown(resumeText);

        return res.status(200).json({
            success: true,
            markdown,
        });
    } catch (error) {
        console.error('Convert to markdown error:', error);

        if (error instanceof Error) {
            if (error.message.includes('not initialized')) {
                return res.status(503).json({
                    success: false,
                    error: 'AI service is not available',
                });
            }
        }

        return res.status(500).json({
            success: false,
            error: 'Failed to convert resume to markdown',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
