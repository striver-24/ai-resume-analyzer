import type { VercelRequest, VercelResponse } from '@vercel/node';
import { chat } from '../../app/lib/ai';
import type { ChatMessage } from '../../app/lib/ai';
import { requireAuth } from '../../app/lib/auth';

/**
 * POST /api/ai/chat
 * 
 * General AI chat endpoint with conversation history support
 * 
 * Request body:
 * {
 *   "messages": [
 *     { "role": "user", "content": "..." },
 *     { "role": "assistant", "content": "..." }
 *   ],
 *   "temperature": 0.7,  // Optional
 *   "maxTokens": 2048    // Optional
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "response": {
 *     "message": { "role": "assistant", "content": "..." },
 *     "usage": [...]
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
        const { messages, temperature, maxTokens } = req.body;

        // Validate messages
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Messages array is required',
            });
        }

        // Validate message format
        for (const msg of messages) {
            if (!msg.role || !msg.content) {
                return res.status(400).json({
                    success: false,
                    error: 'Each message must have role and content',
                });
            }
            if (!['user', 'assistant', 'system'].includes(msg.role)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid message role',
                });
            }
        }

        // Call AI chat
        const response = await chat(messages as ChatMessage[], {
            temperature: temperature || 0.7,
            maxTokens: maxTokens || 2048,
        });

        return res.status(200).json({
            success: true,
            response,
        });
    } catch (error) {
        console.error('Chat error:', error);

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
            error: 'Failed to process chat request',
        });
    }
}
