/**
 * Vercel Serverless Function Entry Point
 * Serves the React Router SSR application
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Import the React Router server build dynamically
    const { default: handler } = await import('../build/server/index.js');
    return await handler(req, res);
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

