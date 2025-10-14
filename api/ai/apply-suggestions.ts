import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../../app/lib/auth';
import { applyAISuggestions, analysisToSuggestions } from '../../app/lib/resume-parser';

/**
 * POST /api/ai/apply-suggestions
 * 
 * Apply AI analysis suggestions to markdown resume
 * 
 * Request body:
 * {
 *   "markdown": "...",       // Current resume markdown
 *   "analysis": {...},       // AI analysis results
 *   "selectedIds": [...]     // Optional: specific suggestion IDs to apply
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "updatedMarkdown": "...",
 *   "appliedCount": 5
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
        const { markdown, analysis, selectedIds } = req.body;

        // Validate required fields
        if (!markdown || typeof markdown !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'markdown is required',
            });
        }

        if (!analysis || typeof analysis !== 'object') {
            return res.status(400).json({
                success: false,
                error: 'analysis is required',
            });
        }

        // Convert analysis to suggestions
        let suggestions = analysisToSuggestions(analysis);

        // Filter by selected IDs if provided
        if (selectedIds && Array.isArray(selectedIds) && selectedIds.length > 0) {
            suggestions = suggestions.filter((_, idx) => selectedIds.includes(idx));
        }

        // Apply suggestions to markdown
        const updatedMarkdown = applyAISuggestions(markdown, suggestions);

        return res.status(200).json({
            success: true,
            updatedMarkdown,
            appliedCount: suggestions.length,
        });
    } catch (error) {
        console.error('Apply suggestions error:', error);

        return res.status(500).json({
            success: false,
            error: 'Failed to apply suggestions',
        });
    }
}
