// VakifBank Sanal POS - Odeme Oturumu Olustur
// CLEAN VERSION (JWT ONLY - NO BASIC AUTH MIX)

const WC_URL = process.env.WOOCOMMERCE_URL || 'https://provanya.com';
const DEBUG_MODE = process.env.PAYMENT_DEBUG === 'true';

export const config = {
  runtime: 'edge',
};

// debug helper
function debugLog(...args: any[]) {
  if (DEBUG_MODE) {
    console.log('[Payment Debug]', new Date().toISOString(), ...args);
  }
}

export default async function handler(request: Request) {
  debugLog('Request:', request.method);

  // CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // JWT token (ONLY SOURCE OF AUTH)
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    debugLog('Token exists:', !!token);

    if (!token) {
      return new Response(JSON.stringify({
        error: 'Unauthorized - missing token'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { order_id, return_url } = await request.json();

    if (!order_id) {
      return new Response(JSON.stringify({
        error: 'order_id required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ONLY forward JWT to WordPress
    const response = await fetch(
      `${WC_URL}/wp-json/bayiportal/v1/payment/create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id,
          return_url: return_url || `${WC_URL}/payment-callback`,
        }),
      }
    );

    const text = await response.text();

    debugLog('WP status:', response.status);
    debugLog('WP response:', text.slice(0, 300));

    if (!response.ok) {
      return new Response(JSON.stringify({
        error: 'Payment session failed',
        status: response.status,
        debug: DEBUG_MODE ? text : undefined
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = JSON.parse(text);

    return new Response(JSON.stringify({
      payment_url: data.payment_url,
      session_id: data.session_id,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[Payment Error]', err);

    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: err instanceof Error ? err.message : 'unknown'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
