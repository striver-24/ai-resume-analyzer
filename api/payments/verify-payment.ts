/**
 * Razorpay Payment Verification Endpoint
 * 
 * This endpoint verifies that a payment was successfully processed by Razorpay.
 * It validates the payment signature to ensure the payment is authentic and was
 * not tampered with. This is a critical security step.
 * 
 * Flow:
 * 1. Frontend sends payment_id, order_id, and signature from Razorpay
 * 2. Backend verifies the signature using HMAC-SHA256
 * 3. If verified, mark payment as successful in database
 * 4. Return success/failure response
 * 
 * Environment Variables Required:
 * - RAZORPAY_KEY_SECRET: Your Razorpay API Key Secret (for signature verification)
 * 
 * Razorpay Documentation: https://razorpay.com/docs/payments/verify-payments/
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

// Get Razorpay secret from environment variables
const RAZORPAY_KEY_SECRET = process.env.RZP_KEY_SECRET || '';

/**
 * Request body type for payment verification
 */
interface VerifyPaymentRequest {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

/**
 * Verification response type
 */
interface VerifyPaymentResponse {
    success: boolean;
    message: string;
    payment_id?: string;
    order_id?: string;
}

/**
 * Verifies the Razorpay payment signature using HMAC-SHA256
 * 
 * Security: This ensures that the payment data hasn't been tampered with
 * and actually came from Razorpay.
 * 
 * @param order_id - The order ID from the payment
 * @param payment_id - The payment ID from Razorpay
 * @param signature - The signature sent by Razorpay
 * @param secret - The Razorpay key secret for verification
 * @returns true if signature is valid, false otherwise
 */
function verifySignature(
    order_id: string,
    payment_id: string,
    signature: string,
    secret: string
): boolean {
    // TODO: This will work once RAZORPAY_KEY_SECRET is configured
    // Signature calculation: HMAC-SHA256(order_id|payment_id, secret)
    const data = `${order_id}|${payment_id}`;
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(data)
        .digest('hex');

    return expectedSignature === signature;
}

/**
 * Main handler for verifying Razorpay payments
 * 
 * POST /api/payments/verify-payment
 * 
 * Request body:
 * {
 *   "razorpay_order_id": "order_DBJOWzybf0sJbb",
 *   "razorpay_payment_id": "pay_DBJOWzybf0sJbb",
 *   "razorpay_signature": "9ef4dffbfd84f1318f6739..."
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Payment verified successfully",
 *   "payment_id": "pay_DBJOWzybf0sJbb",
 *   "order_id": "order_DBJOWzybf0sJbb"
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
        // Validate Razorpay secret is configured
        if (!RAZORPAY_KEY_SECRET) {
            return res.status(503).json({
                success: false,
                message: 'Payment verification service not configured. Please contact support.'
            });
        }

        // Parse and validate request body
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body as VerifyPaymentRequest;

        // Validate all required fields are present
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Missing required payment details (order_id, payment_id, or signature)'
            });
        }

        // Verify signature
        const isValidSignature = verifySignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            RAZORPAY_KEY_SECRET
        );

        if (!isValidSignature) {
            console.warn('Invalid payment signature detected:', {
                order_id: razorpay_order_id,
                payment_id: razorpay_payment_id,
            });

            return res.status(400).json({
                success: false,
                message: 'Payment verification failed. Invalid signature.'
            });
        }

        // Log successful verification
        console.log('Payment verified successfully:', {
            order_id: razorpay_order_id,
            payment_id: razorpay_payment_id,
        });

        return res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id,
        });

    } catch (error) {
        console.error('Payment verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Payment verification failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
