import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateFeedback } from '../../app/lib/ai';
import { requireAuth } from '../../app/lib/auth';

/**
 * POST /api/ai/feedback
 * 
 * Generate AI feedback/analysis for a resume
 * 
 * Request body:
 * {
 *   "resumeText": "...",        // Required: resume content text
 *   "section": "full",          // Required: section name
 *   "question": "..."           // Optional: specific instructions/prompt
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "feedback": "Detailed feedback text..."
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

        // Parse request body
        const { resumeText, section, question } = req.body;

        // Validate required fields
        if (!resumeText || typeof resumeText !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'resumeText is required',
            });
        }

        if (!section || typeof section !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'section is required',
            });
        }

        // Generate feedback
        const feedback = await generateFeedback(
            resumeText,
            section,
            question
        );

        return res.status(200).json({
            success: true,
            feedback,
        });
    } catch (error) {
        console.error('Feedback generation error:', error);

        // Handle specific errors
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
            error: 'Failed to generate feedback',
        });
    }
}
