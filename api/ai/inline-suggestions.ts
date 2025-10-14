import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../../app/lib/auth';
import { getInlineSuggestions } from '../../app/lib/ai';

/**
 * POST /api/ai/inline-suggestions
 * 
 * Get real-time inline suggestions for resume editing
 * 
 * Request body:
 * {
 *   "resumeText": "...",
 *   "jobDescription": "..." (optional)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "suggestions": [
 *     {
 *       "id": "...",
 *       "line": 1,
 *       "column": 0,
 *       "length": 10,
 *       "severity": "error|warning|info",
 *       "category": "ats|content|formatting|grammar",
 *       "message": "...",
 *       "suggestion": "...",
 *       "originalText": "..."
 *     }
 *   ]
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

        // Get request data
        const { resumeText, jobDescription } = req.body;

        if (!resumeText || typeof resumeText !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'resumeText is required',
            });
        }

        // Get inline suggestions from AI
        const suggestions = await getInlineSuggestions(resumeText, jobDescription);

        return res.status(200).json({
            success: true,
            suggestions,
        });

    } catch (error) {
        console.error('Inline suggestions error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to generate suggestions',
        });
    }
}
