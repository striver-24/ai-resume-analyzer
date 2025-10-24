import type { VercelRequest, VercelResponse } from '@vercel/node';
import { rebuildResume } from '../../app/lib/ai';

/**
 * POST /api/ai/rebuild-resume
 * Rebuild resume with all AI suggestions applied
 * 
 * Request body:
 * - resumeText: string (required)
 * - feedback: object (required)
 * - jobDescription: string (optional)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { resumeText, feedback, jobDescription } = req.body;

        if (!resumeText || !feedback) {
            return res.status(400).json({ 
                error: 'Missing required fields: resumeText and feedback' 
            });
        }

        // Generate the rebuilt resume
        const rebuiltResume = await rebuildResume(resumeText, feedback, jobDescription);

        return res.status(200).json({ 
            success: true,
            rebuiltResume 
        });
    } catch (error: any) {
        console.error('Error rebuilding resume:', error);
        return res.status(500).json({ 
            error: error.message || 'Failed to rebuild resume',
            success: false 
        });
    }
}
