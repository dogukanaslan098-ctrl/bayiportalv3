// VakifBank Sanal POS - Odeme Oturumu Olustur
// BayiPortal Plugin API kullanir

const WC_URL = process.env.WOOCOMMERCE_URL || 'https://provanya.com';
const DEBUG_MODE = process.env.PAYMENT_DEBUG === 'true';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    // Bayi token'ini al (client'tan gelen)
    const authHeader = request.headers.get('Authorization');
    const bayiToken = authHeader?.replace('Bearer ', '');

    if (!bayiToken) {
      return new Response(JSON.stringify({ 
        error: 'Oturum suresi dolmus. Lutfen tekrar giris yapin.'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const body = await request.json();
    const { order_id, return_url } = body;

    if (!order_id) {
      return new Response(JSON.stringify({ error: 'Siparis ID gerekli' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (DEBUG_MODE) {
      console.log('[Payment] Odeme oturumu olusturuluyor, siparis:', order_id);
    }

    // BayiPortal Plugin API'sine istek at (Bearer token ile)
    const paymentEndpoint = `${WC_URL}/wp-json/bayiportal/v1/payment/create`;
    
    const response = await fetch(paymentEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bayiToken}`,
      },
      body: JSON.stringify({
        order_id,
        return_url: return_url || `${WC_URL}/payment-callback`,
      }),
    });

    const responseText = await response.text();
    
    if (DEBUG_MODE) {
      console.log('[Payment] API yaniti:', response.status, responseText.substring(0, 500));
    }

    if (!response.ok) {
      let errorMessage = 'Odeme oturumu olusturulamadi';
      
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        if (errorData.code === 'unauthorized' || response.status === 401) {
          errorMessage = 'Oturum suresi dolmus. Lutfen tekrar giris yapin.';
        }
      } catch {
        // JSON parse hatasi
      }

      return new Response(JSON.stringify({ 
        error: errorMessage,
        debug: DEBUG_MODE ? { status: response.status, response: responseText.substring(0, 200) } : undefined
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const paymentData = JSON.parse(responseText);
    
    if (!paymentData.payment_url) {
      return new Response(JSON.stringify({ 
        error: 'Odeme URL\'si alinamadi. Lutfen tekrar deneyin.'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({
      payment_url: paymentData.payment_url,
      session_id: paymentData.session_id,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('[Payment] Hata:', error);
    return new Response(JSON.stringify({ 
      error: 'Odeme islemi sirasinda bir hata olustu.',
      debug: DEBUG_MODE ? { message: error instanceof Error ? error.message : 'Unknown' } : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
