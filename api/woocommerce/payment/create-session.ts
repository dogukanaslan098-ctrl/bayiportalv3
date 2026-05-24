// VakifBank Sanal POS - Odeme Oturumu Olustur
// Vercel Serverless Function

const WC_URL = process.env.WOOCOMMERCE_URL || 'https://provanya.com';
const WC_KEY = process.env.WOOCOMMERCE_KEY || '';
const WC_SECRET = process.env.WOOCOMMERCE_SECRET || '';
const DEBUG_MODE = process.env.PAYMENT_DEBUG === 'true';

function debugLog(...args: unknown[]) {
  if (DEBUG_MODE) {
    console.log('[Payment]', ...args);
  }
}

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  // CORS
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

  // Ortam degiskenleri kontrolu
  if (!WC_KEY || !WC_SECRET) {
    console.error('[Payment] WooCommerce credentials eksik');
    return new Response(JSON.stringify({ 
      error: 'Odeme sistemi yapilandirmasi eksik. Lutfen Vercel ortam degiskenlerini kontrol edin (WOOCOMMERCE_KEY, WOOCOMMERCE_SECRET).'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    const body = await request.json();
    const { order_id, return_url } = body;

    if (!order_id) {
      return new Response(JSON.stringify({ error: 'Siparis ID gerekli' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    debugLog('Odeme oturumu olusturuluyor, siparis:', order_id);

    // WooCommerce REST API - Basic Auth
    const authString = btoa(`${WC_KEY}:${WC_SECRET}`);
    
    const paymentEndpoint = `${WC_URL}/wp-json/bayiportal/v1/payment/create`;
    
    const response = await fetch(paymentEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify({
        order_id,
        return_url: return_url || `${WC_URL}/payment-callback`,
      }),
    });

    const responseText = await response.text();
    debugLog('API yaniti:', response.status, responseText.substring(0, 300));

    // Hata kontrolu
    if (!response.ok) {
      let errorMessage = 'Odeme oturumu olusturulamadi';
      
      try {
        const errorData = JSON.parse(responseText);
        
        // WooCommerce hata mesajlarini duzelt
        if (errorData.message) {
          if (errorData.message.includes('Kullanıcı adı bilinmiyor') || 
              errorData.message.includes('Unknown username') ||
              errorData.code === 'invalid_username') {
            errorMessage = 'WooCommerce API anahtari gecersiz. Lutfen Vercel ortam degiskenlerini kontrol edin.';
          } else if (errorData.code === 'rest_forbidden' || response.status === 403) {
            errorMessage = 'API erisim yetkisi yok. WooCommerce API anahtari izinlerini kontrol edin.';
          } else {
            errorMessage = errorData.message;
          }
        }
      } catch {
        // JSON parse hatasini yoksay
      }

      return new Response(JSON.stringify({ 
        error: errorMessage,
        debug: DEBUG_MODE ? { status: response.status, response: responseText.substring(0, 200) } : undefined
      }), {
        status: response.status === 401 ? 500 : response.status, // 401'i 500 olarak dondur (config hatasi)
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Basarili yanit
    const paymentData = JSON.parse(responseText);
    
    if (!paymentData.payment_url) {
      return new Response(JSON.stringify({ 
        error: 'Odeme URL\'si alinamadi. Lutfen tekrar deneyin.'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    debugLog('Odeme oturumu olusturuldu');

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
      error: 'Odeme islemi sirasinda bir hata olustu. Lutfen tekrar deneyin.',
      debug: DEBUG_MODE ? { message: error instanceof Error ? error.message : 'Unknown' } : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
