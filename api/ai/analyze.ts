import type { VercelRequest, VercelResponse } from '@vercel/node';
import { analyzeResume, extractTextFromFile } from '../../app/lib/ai';
import type { ResumeAnalysis } from '../../app/lib/ai';
import { requireAuth } from '../../app/lib/auth';
import { updateResumeAnalysis } from '../../app/lib/db';

/**
 * POST /api/ai/analyze
 * 
 * Comprehensive resume analysis endpoint
 * 
 * Request body:
 * {
 *   "resumeText": "...",     // Optional if resumePath provided
 *   "resumePath": "...",     // Optional if resumeText provided
 *   "resumeId": "...",       // Optional: resume ID to save analysis
 *   "jobDescription": "..."  // Optional: for targeted analysis
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "analysis": {
 *     "ats_score": 85,
 *     "overall_score": 82,
 *     "strengths": [...],
 *     "weaknesses": [...],
 *     "improvements": [...],
 *     "sections": [...],
 *     "keywords": {...},
 *     "summary": "..."
 *   }
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
        const { resumeText, resumePath, resumeId, jobDescription } = req.body;

        // Need either resumeText or resumePath
        if (!resumeText && !resumePath) {
            return res.status(400).json({
                success: false,
                error: 'Either resumeText or resumePath is required',
            });
        }

        // Extract text if path provided
        let textToAnalyze = resumeText;
        if (!textToAnalyze && resumePath) {
            try {
                textToAnalyze = await extractTextFromFile(resumePath);
            } catch (error) {
                console.error('Text extraction error:', error);
                return res.status(400).json({
                    success: false,
                    error: 'Failed to extract text from resume file',
                });
            }
        }

        // Validate extracted text
        if (!textToAnalyze || textToAnalyze.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No text content found in resume',
            });
        }

        // Analyze resume
        const analysis: ResumeAnalysis = await analyzeResume(
            textToAnalyze,
            jobDescription
        );

        // Save analysis to database if resumeId provided
        if (resumeId) {
            try {
                await updateResumeAnalysis(resumeId, analysis);
            } catch (error) {
                console.error('Failed to save analysis:', error);
                // Continue even if save fails
            }
        }

        return res.status(200).json({
            success: true,
            analysis,
        });
    } catch (error) {
        console.error('Analysis error:', error);

        // Handle specific errors
        if (error instanceof Error) {
            if (error.message.includes('not initialized')) {
                return res.status(503).json({
                    success: false,
                    error: 'AI service is not available',
                });
            }
            if (error.message.includes('Failed to analyze')) {
                return res.status(500).json({
                    success: false,
                    error: error.message,
                });
            }
        }

        return res.status(500).json({
            success: false,
            error: 'Failed to analyze resume',
        });
    }
}
