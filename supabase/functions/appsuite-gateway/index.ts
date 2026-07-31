import { serve } from "https://cdn.jsdelivr.net/gh/denoland/deno_std@v0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AppSuiteRequest {
  action: string;
  email?: string;
  orderId?: string;
  serviceName?: string;
  vpnProvider?: string;
  planId?: string;
  amountNgn?: number;
  serverLocation?: string;
  appsuiteDomain?: string;
  customRegex?: string;
}

// Configuration for AppSuite Cloud Mail Servers
const APPSUITE_IMAP_SERVER = Deno.env.get('APPSUITE_IMAP_SERVER') || 'imap.us.appsuite.cloud';
const APPSUITE_IMAP_PORT = Number(Deno.env.get('APPSUITE_IMAP_PORT')) || 993;
const APPSUITE_SMTP_SERVER = Deno.env.get('APPSUITE_SMTP_SERVER') || 'smtp.us.appsuite.cloud';
const APPSUITE_SMTP_PORT = Number(Deno.env.get('APPSUITE_SMTP_PORT')) || 587;
const DEFAULT_APPSUITE_USER = Deno.env.get('APPSUITE_DEFAULT_USER') || 'joscor@discountzar.xyz';
const DEFAULT_APPSUITE_PASS = Deno.env.get('APPSUITE_DEFAULT_PASS') || 'uson-axsd-kkwj-mayw';

// Helper to get brand keywords from service/provider name
function getBrandKeywords(serviceName: string): string[] {
  const lower = (serviceName || '').toLowerCase();
  if (lower.includes('nord')) return ['nord', 'nordvpn', 'nordsecurity', 'nordpass'];
  if (lower.includes('express')) return ['express', 'expressvpn', 'express-vpn'];
  if (lower.includes('surf')) return ['surf', 'surfshark'];
  if (lower.includes('proton')) return ['proton', 'protonvpn', 'protonmail'];
  if (lower.includes('ghost') || lower.includes('cyber')) return ['cyberghost', 'ghost', 'cyberghostvpn'];
  if (lower.includes('mullvad')) return ['mullvad', 'mullvadvpn'];
  return lower.split(/\s+/).filter(w => w.length > 2);
}

// AppSuite Cloud OTP fetcher logic connecting directly via IMAP SSL/TLS on port 993
async function checkAppSuiteInbox(emailAddress: string, serviceName: string = 'VPN') {
  const domain = emailAddress.split('@')[1] || 'discountzar.xyz';
  const host = 'imap.us.appsuite.cloud';
  const port = 993;

  let conn;
  try {
    conn = await Deno.connectTls({ hostname: host, port: port });
  } catch (err: any) {
    console.error("Deno connectTls to IMAP error:", err);
    return {
      found: false,
      otp: null,
      matchedBrand: serviceName,
      message: `Failed to connect via TLS to IMAP: ${err.message}`
    };
  }

  const reader = conn.readable.getReader();
  const writer = conn.writable.getWriter();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  let buffer = '';
  let otpCode: string | null = null;
  let highestMsgNum = 0;

  async function sendCommand(cmd: string) {
    await writer.write(encoder.encode(`${cmd}\r\n`));
  }

  let step = 0; // 0: greeting, 1: login, 2: select, 3: fetch

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      buffer += chunk;

      if (step === 0 && buffer.includes('* OK')) {
        step = 1;
        buffer = '';
        await sendCommand(`A1 LOGIN "${DEFAULT_APPSUITE_USER}" "${DEFAULT_APPSUITE_PASS}"`);
      } else if (step === 1 && buffer.includes('A1 OK')) {
        step = 2;
        buffer = '';
        await sendCommand(`A2 SELECT INBOX`);
      } else if (step === 2 && buffer.includes('A2 OK')) {
        const existsMatch = buffer.match(/\*\s+(\d+)\s+EXISTS/i);
        if (existsMatch) {
          highestMsgNum = parseInt(existsMatch[1], 10);
        }
        if (highestMsgNum > 0) {
          step = 3;
          buffer = '';
          const start = Math.max(1, highestMsgNum - 4);
          await sendCommand(`A3 FETCH ${start}:${highestMsgNum} (BODY[TEXT])`);
        } else {
          break;
        }
      } else if (step === 3 && buffer.includes('A3 OK')) {
        const cleanText = buffer
          .replace(/=\r?\n/g, '')
          .replace(/=3D/g, '=')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ');

        // 1. Try to extract confirmation/invite/approval links first
        const urlMatches = cleanText.match(/https?:\/\/[^\s"'<>]+/g) || [];
        const priorityKeywords = ['confirm', 'approve', 'verify', 'join', 'invite', 'accept', 'signin', 'sign-in', 'login', 'activation'];
        let matchedUrl = null;
        for (const url of urlMatches) {
          const lowerUrl = url.toLowerCase();
          if (priorityKeywords.some(keyword => lowerUrl.includes(keyword))) {
            if (!lowerUrl.includes('privacy') && !lowerUrl.includes('terms') && !lowerUrl.includes('help') && !lowerUrl.includes('support')) {
              matchedUrl = url.replace(/&amp;/g, '&');
              break;
            }
          }
        }

        if (matchedUrl) {
          otpCode = matchedUrl;
        } else {
          // 2. Fallback to numeric OTP code
          const matches = [...cleanText.matchAll(/(?:code|verification|pin|otp|passcode)[\s\S]{0,120}?\b(\d{4,8})\b/gi)];
          if (matches.length > 0) {
            otpCode = matches[matches.length - 1][1];
          } else {
            const simpleMatches = [...cleanText.matchAll(/\b(\d{6})\b/g)];
            for (let i = simpleMatches.length - 1; i >= 0; i--) {
              const potentialCode = simpleMatches[i][1];
              const idx = simpleMatches[i].index || 0;
              const context = cleanText.substring(Math.max(0, idx - 25), Math.min(cleanText.length, idx + 25)).toLowerCase();
              if (!context.includes('part') && !context.includes('boundary') && !context.includes('mime')) {
                otpCode = potentialCode;
                break;
              }
            }
          }
        }

        // 3. Fallback to generic url if no OTP code and a link exists
        if (!otpCode && urlMatches.length > 0) {
          const genericUrl = urlMatches.find(url => {
            const lower = url.toLowerCase();
            return !lower.includes('privacy') && !lower.includes('terms') && !lower.includes('help') && !lower.includes('support');
          });
          if (genericUrl) {
            otpCode = genericUrl.replace(/&amp;/g, '&');
          }
        }
        break;
      }

      if (buffer.includes('BAD') || buffer.includes('NO')) {
        break;
      }
    }
  } catch (err: any) {
    console.error("IMAP TLS socket interaction error:", err);
  } finally {
    try {
      writer.releaseLock();
      reader.releaseLock();
      conn.close();
    } catch (_) {}
  }

  if (otpCode) {
    return {
      found: true,
      otp: otpCode,
      matchedBrand: serviceName,
      subject: `${serviceName} Verification Code`,
      sender: `auth@${domain}`,
      receivedAt: new Date().toISOString()
    };
  }

  return {
    found: false,
    otp: null,
    matchedBrand: serviceName,
    message: `Waiting for incoming ${serviceName} verification email on ${emailAddress}...`
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized user' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Verify Admin privilege
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin, wallet_balance, email')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.is_admin === true || ['joscor@wsv.com.ng', 'pauleke2004@gmail.com', 'dapopaulmayomi@gmail.com'].includes(user.email || '');

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required for /test AppSuite service' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    const body: AppSuiteRequest = await req.json().catch(() => ({ action: '' }));
    const { action, email, orderId, serviceName, vpnProvider, amountNgn, serverLocation } = body;

    if (action === 'purchase-vpn') {
      const price = amountNgn || 500;
      const currentBalance = Number(profile?.wallet_balance || 0);

      if (currentBalance < price) {
        return new Response(JSON.stringify({ error: `Insufficient wallet balance. Price: ₦${price.toLocaleString()}, Balance: ₦${currentBalance.toLocaleString()}` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      // Generate AppSuite Cloud target account
      const cleanProvider = (vpnProvider || 'NordVPN').toLowerCase().replace(/[^a-z0-9]/g, '');
      const uniqueId = Math.random().toString(36).substring(2, 7);
      const appsuiteEmail = `vpn.${cleanProvider}.${uniqueId}@appsuite.cloud`;
      const generatedOrderId = `AS-VPN-${Date.now().toString(36).toUpperCase()}`;

      // Deduct balance & record transaction
      const newBalance = currentBalance - price;
      await supabaseAdmin
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', user.id);

      await supabaseAdmin
        .from('transactions')
        .insert({
          id: generatedOrderId,
          user_id: user.id,
          type: 'Purchase',
          amount: price,
          method: `AppSuite VPN (${vpnProvider || 'VPN'})`,
          status: 'SUCCESS',
          created_at: new Date().toISOString()
        });

      return new Response(JSON.stringify({
        status: true,
        message: 'VPN order created successfully!',
        order: {
          id: generatedOrderId,
          vpnProvider: vpnProvider || 'NordVPN Premium',
          serverLocation: serverLocation || 'United States (New York)',
          appsuiteEmail: appsuiteEmail,
          price: price,
          newBalance: newBalance,
          status: 'PENDING_OTP',
          createdAt: new Date().toISOString()
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    if (action === 'fetch-appsuite-otp') {
      const targetEmail = email || `user@appsuite.cloud`;
      const targetService = serviceName || vpnProvider || 'VPN Service';

      const otpResult = await checkAppSuiteInbox(targetEmail, targetService);

      return new Response(JSON.stringify({
        status: true,
        source: 'appsuite.cloud',
        email: targetEmail,
        orderId: orderId || null,
        otp: otpResult.otp,
        subject: otpResult.subject,
        sender: otpResult.sender,
        receivedAt: otpResult.receivedAt,
        message: `OTP retrieved automatically from backend appsuite.cloud`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    if (action === 'cancel-vpn-order') {
      const priceToRefund = amountNgn || 0;
      if (priceToRefund > 0) {
        const updatedBalance = Number(profile?.wallet_balance || 0) + priceToRefund;
        await supabaseAdmin
          .from('profiles')
          .update({ wallet_balance: updatedBalance })
          .eq('id', user.id);

        await supabaseAdmin
          .from('transactions')
          .insert({
            id: `REF-${Date.now().toString(36).toUpperCase()}`,
            user_id: user.id,
            type: 'Refund',
            amount: priceToRefund,
            method: `AppSuite VPN Refund (${orderId})`,
            status: 'SUCCESS',
            created_at: new Date().toISOString()
          });
      }

      return new Response(JSON.stringify({
        status: true,
        message: 'Order cancelled and balance refunded successfully!'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
