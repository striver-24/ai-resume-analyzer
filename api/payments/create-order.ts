/**
 * Razorpay Create Order Endpoint
 * 
 * This endpoint handles the creation of Razorpay payment orders.
 * It validates user input, creates an order on Razorpay, and returns
 * the order details needed for payment processing on the frontend.
 * 
 * Environment Variables Required:
 * - RAZORPAY_KEY_ID: Your Razorpay API Key ID (get from Razorpay Dashboard > Account Settings > API Keys)
 * - RAZORPAY_KEY_SECRET: Your Razorpay API Key Secret (get from Razorpay Dashboard > Account Settings > API Keys)
 * 
 * Razorpay Documentation: https://razorpay.com/docs/api/orders/
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Razorpay from 'razorpay';
// TODO: Uncomment when backend session handling is implemented
// import { getSessionByToken } from '~/app/lib/db';
import { parse } from 'cookie';

// Get Razorpay credentials from environment variables
const RAZORPAY_KEY_ID = process.env.RZP_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RZP_KEY_SECRET || '';

// Validate that credentials are configured
if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    console.warn(
        'Razorpay credentials not configured. ' +
        'Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.'
    );
}

/**
 * Initialize Razorpay instance with credentials
 * TODO: Update this when Razorpay credentials are available
 */
const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
});

/**
 * Request body type for create order
 */
interface CreateOrderRequest {
    amount: number; // Amount in paise (1 rupee = 100 paise)
    currency?: string; // Default: INR
    description?: string;
    notes?: Record<string, string>;
    customer_notify?: number; // 1 or 0
}

/**
 * Response type for successful order creation
 */
interface CreateOrderResponse {
    id: string;
    entity: string;
    amount: number;
    currency: string;
    receipt: string;
    created_at: number;
}

/**
 * Validates the amount is within acceptable range
 * TODO: Configure min/max amounts based on your pricing strategy
 */
function validateAmount(amount: number): boolean {
    const MIN_AMOUNT = 100; // 1 rupee (in paise)
    const MAX_AMOUNT = 5000000; // 50,000 rupees (in paise)
    
    return amount >= MIN_AMOUNT && amount <= MAX_AMOUNT;
}

/**
 * Main handler for creating Razorpay orders
 * 
 * POST /api/payments/create-order
 * 
 * Request body:
 * {
 *   "amount": 50000,  // in paise (₹500)
 *   "currency": "INR",
 *   "description": "Premium Resume Analysis",
 *   "notes": {
 *     "plan": "pro",
 *     "features": "ATS scoring, AI suggestions"
 *   }
 * }
 */
export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // TODO: Uncomment when Razorpay credentials are available
        // // Verify user is authenticated (optional but recommended)
        // const cookies = parse(req.headers.cookie || '');
        // const sessionToken = cookies.session_token;
        
        // if (!sessionToken) {
        //     return res.status(401).json({ error: 'Unauthorized. Please login first.' });
        // }
        
        // // Verify session validity
        // const session = await getSessionByToken(sessionToken);
        // if (!session) {
        //     return res.status(401).json({ error: 'Invalid or expired session.' });
        // }

        // Validate Razorpay credentials are configured
        if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
            return res.status(503).json({
                error: 'Payment service not configured',
                message: 'Razorpay credentials are missing. Please contact support.'
            });
        }

        // Parse and validate request body
        const {
            amount,
            currency = 'INR',
            description = 'Premium Features',
            notes = {},
            customer_notify = 1,
        } = req.body as CreateOrderRequest;

        // Validate required fields
        if (!amount || typeof amount !== 'number') {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'Amount is required and must be a number (in paise)'
            });
        }

        // Validate amount range
        if (!validateAmount(amount)) {
            return res.status(400).json({
                error: 'Invalid amount',
                message: 'Amount must be between ₹1 and ₹50,000'
            });
        }

        // Create Razorpay order
        try {
            const order = await razorpay.orders.create({
                amount: Math.round(amount), // Ensure amount is in paise
                currency,
                receipt: `receipt_${Date.now()}`,
                description,
                notes: {
                    ...notes,
                    created_at: new Date().toISOString(),
                },
                customer_notify,
            } as any);

            return res.status(200).json({
                success: true,
                order: {
                    id: order.id,
                    entity: order.entity,
                    amount: order.amount,
                    currency: order.currency,
                    receipt: order.receipt,
                    created_at: order.created_at,
                }
            });
        } catch (razorpayError: any) {
            console.error('Razorpay order creation error:', razorpayError);
            return res.status(400).json({
                error: 'Order creation failed',
                message: razorpayError.message || 'Failed to create payment order'
            });
        }

    } catch (error) {
        console.error('Create order handler error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
}
