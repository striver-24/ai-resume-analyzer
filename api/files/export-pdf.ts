import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../../app/lib/auth';

/**
 * POST /api/files/export-pdf
 * 
 * Generate PDF from markdown resume (client-side download link)
 * Note: Actual PDF generation happens client-side for better quality
 * This endpoint can be used for server-side generation if needed
 * 
 * Request body:
 * {
 *   "markdown": "...",
 *   "format": "a4" | "letter",
 *   "filename": "resume.pdf"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Use client-side PDF generation for best results"
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

        // Note: Server-side PDF generation would require puppeteer
        // which is heavy for serverless. Client-side generation is preferred.
        
        return res.status(200).json({
            success: true,
            message: 'PDF generation is handled client-side for better quality and performance',
            recommendation: 'Use the downloadPDF() function from app/lib/pdf-export.ts',
        });

    } catch (error) {
        console.error('PDF export endpoint error:', error);
        return res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
}
