/**
 * Razorpay Payment Service
 * Handles all communication with the Django Razorpay endpoints.
 */

import { api, API_BASE_URL } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface CreateOrderRequest {
  amount: number;          // INR  e.g. 500
  currency?: string;       // default "INR"
  consultation_id?: string;
  description?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  data: {
    order_id: string;
    amount: number;          // paise
    amount_inr: number;      // INR
    currency: string;
    key_id: string;          // rzp_test_...
    receipt: string;
    notes: Record<string, string>;
    razorpay_order_db_id: string;
  };
  message: string;
  timestamp: string;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  data: {
    payment_id: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    amount: number;
    currency: string;
    status: string;
    payment_method: string;
    completed_at: string;
  };
  message: string;
  timestamp: string;
}

export interface OrderStatusResponse {
  success: boolean;
  data: {
    razorpay_order_id: string;
    razorpay_payment_id: string | null;
    amount: number;
    currency: string;
    status: 'created' | 'paid' | 'failed';
    is_verified: boolean;
    payment_id: string | null;
    created_at: string;
    updated_at: string;
  };
  message: string;
  timestamp: string;
}

// Razorpay checkout options shape
export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

// Razorpay global type
declare global {
  interface Window {
    Razorpay: new (options: RazorpayCheckoutOptions) => { open: () => void };
  }
}

// ─── Service ────────────────────────────────────────────────────────────────

export const razorpayService = {
  /**
   * Step 1 — Create a Razorpay order on the backend.
   */
  async createOrder(payload: CreateOrderRequest): Promise<CreateOrderResponse> {
    const response = await api.post('/api/payments/razorpay/create-order/', payload);
    return response.data;
  },

  /**
   * Step 2 — Verify the payment after the checkout popup closes.
   */
  async verifyPayment(payload: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    const response = await api.post('/api/payments/razorpay/verify-payment/', payload);
    return response.data;
  },

  /**
   * Poll payment status for a given Razorpay order id.
   */
  async getOrderStatus(orderId: string): Promise<OrderStatusResponse> {
    const response = await api.get(`/api/payments/razorpay/order-status/${orderId}/`);
    return response.data;
  },

  /**
   * Load the Razorpay checkout.js script dynamically (CDN).
   */
  loadScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-checkout-js')) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-js';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  /**
   * Open the Razorpay payment popup.
   * Returns a promise that resolves with the payment response tokens or
   * rejects when the user dismisses the modal.
   */
  openCheckout(options: RazorpayCheckoutOptions): Promise<{
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }> {
    return new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        reject(new Error('Razorpay script not loaded'));
        return;
      }
      const rzp = new window.Razorpay({
        ...options,
        handler: (response) => resolve(response),
        modal: {
          ondismiss: () => reject(new Error('Payment cancelled by user')),
        },
      });
      rzp.open();
    });
  },

  /**
   * Convenience: full flow — create order → open popup → verify.
   */
  async initiatePayment(
    orderPayload: CreateOrderRequest,
    prefillData?: { name?: string; email?: string; contact?: string },
    onStatusChange?: (status: 'loading' | 'popup' | 'verifying' | 'success' | 'failed' | 'cancelled') => void
  ): Promise<VerifyPaymentResponse> {
    onStatusChange?.('loading');

    // 1. Load script
    const scriptLoaded = await this.loadScript();
    if (!scriptLoaded) throw new Error('Failed to load Razorpay payment SDK');

    // 2. Create backend order
    const orderResponse = await this.createOrder(orderPayload);
    if (!orderResponse.success) throw new Error('Failed to create payment order');

    const { order_id, amount, currency, key_id, notes } = orderResponse.data;

    onStatusChange?.('popup');

    // 3. Open checkout
    let paymentTokens: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    };

    try {
      paymentTokens = await this.openCheckout({
        key: key_id,
        amount,
        currency,
        name: 'Sushrusha eClinic',
        description: notes.description || 'Consultation Payment',
        order_id,
        prefill: prefillData,
        theme: { color: '#E17726' },
        handler: () => {}, // overridden inside openCheckout
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message === 'Payment cancelled by user') {
        onStatusChange?.('cancelled');
      } else {
        onStatusChange?.('failed');
      }
      throw err;
    }

    onStatusChange?.('verifying');

    // 4. Verify on backend
    const verifyResponse = await this.verifyPayment(paymentTokens);
    if (!verifyResponse.success) {
      onStatusChange?.('failed');
      throw new Error('Payment verification failed');
    }

    onStatusChange?.('success');
    return verifyResponse;
  },
};
