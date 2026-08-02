import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

const SENDBYTE_API_KEY = Deno.env.get("SENDBYTE_API_KEY") || Deno.env.get("RESEND_API_KEY") || "";
const SENDER_EMAIL = "support@discountzar.ng"; // verified domain on SendByte

// Supabase client (Service Role for admin DB access)
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// --- HTML Email Templates ---

const wrapEmailTemplate = (contentHtml: string) => `
<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0c; color: #ffffff; padding: 30px; border-radius: 16px; border: 1px solid rgba(72, 58, 172, 0.2); box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);">
  <div style="text-align: center; margin-bottom: 24px;">
    <img src="https://discountzar.ng/logo.png" alt="DiscountZAR Logo" style="width: 64px; height: 64px; border-radius: 14px; box-shadow: 0 4px 20px rgba(72, 58, 172, 0.3);" />
  </div>
  ${contentHtml}
  <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.05); margin: 30px 0;" />
  <div style="text-align: center; font-size: 12px; color: #737784; line-height: 1.5;">
    <p style="margin: 0 0 5px 0;">© 2026 DiscountZAR. All rights reserved.</p>
    <p style="margin: 0;">If you have any questions, reply to this email or contact support at <a href="mailto:support@discountzar.ng" style="color: #483aac; text-decoration: none;">support@discountzar.ng</a></p>
  </div>
</div>
`;

const generateWelcomeEmail = (name: string) => wrapEmailTemplate(`
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 26px; font-weight: 800;">Welcome to DiscountZar Plus! 🚀</h1>
    <p style="color: #c3c6d5; font-size: 16px; margin: 0;">Your premium service hub is ready.</p>
  </div>
  <p style="font-size: 15px; color: #c3c6d5; line-height: 1.6;">Hi <strong>${name || 'Customer'}</strong>,</p>
  <p style="font-size: 15px; color: #c3c6d5; line-height: 1.6;">
    Thank you for joining <strong>DiscountZAR</strong>! We are thrilled to have you on board.
    You now have access to premium digital services, including shared subscriptions, SMS OTP numbers, eSIMs, and SMM Panel boosts.
  </p>
  <p style="font-size: 15px; color: #c3c6d5; line-height: 1.6;">
    To get started, generate your virtual PocketFi funding account and top up your wallet instantly.
  </p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="https://discountzar.ng/dashboard" style="background: linear-gradient(135deg, #483aac 0%, #3366cc 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 15px rgba(72, 58, 172, 0.4);">Go to Dashboard</a>
  </div>
`);

const generateFundingEmail = (amount: any, reference: string) => wrapEmailTemplate(`
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #10b981; margin: 0 0 10px 0; font-size: 26px; font-weight: 800;">Wallet Funded! 💰</h1>
    <p style="color: #c3c6d5; font-size: 16px; margin: 0;">Your deposit has been successfully credited.</p>
  </div>
  
  <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 10px; margin: 24px 0; text-align: center;">
    <p style="margin: 0 0 8px 0; color: #737784; font-size: 13px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.05em;">Amount Credited</p>
    <p style="margin: 0; font-size: 32px; font-weight: 800; color: #ffffff;">₦${Number(amount).toLocaleString()}</p>
  </div>
  
  <p style="font-size: 14px; color: #737784; margin: 10px 0; font-family: monospace;">Transaction Ref: ${reference}</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="https://discountzar.ng/dashboard" style="background: #483aac; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; display: inline-block;">View Wallet Balance</a>
  </div>
`);

const generateAdminFundingEmail = (userProfile: any, amount: any, method: any, reference: any) => wrapEmailTemplate(`
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #483aac; margin: 0 0 10px 0; font-size: 26px; font-weight: 800;">Deposit Alert 🔔</h1>
    <p style="color: #c3c6d5; font-size: 16px; margin: 0;">A user has successfully funded their wallet.</p>
  </div>
  
  <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 10px; margin: 24px 0;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr>
        <td style="padding: 10px 0; color: #737784; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">User:</td>
        <td style="padding: 10px 0; color: #ffffff; text-align: right; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-weight: bold;">
          ${userProfile.full_name || userProfile.username || 'N/A'} (${userProfile.email || 'No email'})
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 0; color: #737784; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">Amount:</td>
        <td style="padding: 10px 0; color: #10b981; text-align: right; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-weight: bold; font-size: 16px;">
          ₦${Number(amount).toLocaleString()}
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 0; color: #737784; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">Method:</td>
        <td style="padding: 10px 0; color: #ffffff; text-align: right; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">${method}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; color: #737784;">ID:</td>
        <td style="padding: 10px 0; color: #737784; text-align: right; font-family: monospace;">${reference}</td>
      </tr>
    </table>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="https://discountzar.ng/dashboard/admin" style="background: linear-gradient(135deg, #483aac 0%, #3366cc 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; display: inline-block;">Go to Admin Console</a>
  </div>
`);

const generateVirtualAccountEmail = (name: string, bankName: string, accountNumber: string, accountName: string) => wrapEmailTemplate(`
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #483aac; margin: 0 0 10px 0; font-size: 26px; font-weight: 800;">Dedicated Account Ready 🏦</h1>
    <p style="color: #c3c6d5; font-size: 16px; margin: 0;">Fund your wallet automatically anytime.</p>
  </div>
  <p style="font-size: 15px; color: #c3c6d5; line-height: 1.6;">Hi <strong>${name || 'Customer'}</strong>,</p>
  <p style="font-size: 15px; color: #c3c6d5; line-height: 1.6;">
    Your dedicated virtual bank account is now active. You can fund your wallet instantly at any time by making a bank transfer to this account:
  </p>
  
  <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 10px; margin: 24px 0;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr>
        <td style="padding: 10px 0; color: #737784; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">Bank Name:</td>
        <td style="padding: 10px 0; color: #ffffff; text-align: right; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-weight: bold;">${bankName}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; color: #737784; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">Account Number:</td>
        <td style="padding: 10px 0; color: #483aac; text-align: right; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-weight: bold; font-family: monospace; font-size: 18px; letter-spacing: 1px;">${accountNumber}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; color: #737784;">Account Name:</td>
        <td style="padding: 10px 0; color: #ffffff; text-align: right; font-weight: bold;">${accountName}</td>
      </tr>
    </table>
  </div>
  
  <p style="font-size: 13.5px; color: #737784; line-height: 1.5;">
    Deposits sent to this account are credited to your DiscountZAR wallet automatically within seconds.
  </p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="https://discountzar.ng/dashboard" style="background: linear-gradient(135deg, #483aac 0%, #3366cc 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; display: inline-block;">Go to Dashboard</a>
  </div>
`);

const generateOtpRequestedEmail = (service: string, phone: string, server: string, cost: any) => wrapEmailTemplate(`
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #483aac; margin: 0 0 10px 0; font-size: 26px; font-weight: 800;">Number Assigned 📲</h1>
    <p style="color: #c3c6d5; font-size: 16px; margin: 0;">Your temporary SMS verification number is ready.</p>
  </div>
  
  <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 10px; margin: 24px 0; text-align: center;">
    <p style="margin: 0 0 8px 0; color: #737784; font-size: 13px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.05em;">Your Temporary Number</p>
    <p style="margin: 0; font-size: 28px; font-weight: 800; color: #483aac; font-family: monospace; letter-spacing: 1px;">${phone}</p>
  </div>
  
  <div style="background: rgba(255, 255, 255, 0.01); border: 1px solid rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr>
        <td style="padding: 8px 0; color: #737784;">Service:</td>
        <td style="padding: 8px 0; color: #ffffff; text-align: right; font-weight: bold;">${service}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #737784;">Server Gateway:</td>
        <td style="padding: 8px 0; color: #ffffff; text-align: right;">${server === 'server1' ? 'Server 1' : server === 'server2' ? 'Server 2' : server === 'server3' ? 'Server 3' : 'Server 4'}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #737784;">Cost:</td>
        <td style="padding: 8px 0; color: #483aac; text-align: right; font-weight: bold;">₦${Number(cost).toLocaleString()}</td>
      </tr>
    </table>
  </div>
  
  <p style="font-size: 13.5px; color: #737784; line-height: 1.5;">
    Please enter this number on the target application's phone input field. Once the verification text code arrives, we will notify you immediately.
  </p>
`);

const generateOtpReceivedEmail = (service: string, phone: string, code: string, smsText: string) => wrapEmailTemplate(`
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #10b981; margin: 0 0 10px 0; font-size: 26px; font-weight: 800;">SMS Code Received! 🎉</h1>
    <p style="color: #c3c6d5; font-size: 16px; margin: 0;">Verification code for ${service} has arrived.</p>
  </div>
  
  <p style="font-size: 15px; color: #c3c6d5; text-align: center;">Your temporary number <strong>${phone}</strong> received the code:</p>
  
  <div style="background: rgba(16, 185, 129, 0.05); border: 2px dashed #10b981; padding: 24px; border-radius: 12px; margin: 24px 0; text-align: center;">
    <span style="font-size: 12px; color: #737784; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 8px; letter-spacing: 0.05em;">Verification Code</span>
    <span style="font-size: 36px; font-weight: 900; color: #10b981; font-family: monospace; letter-spacing: 4px;">${code}</span>
  </div>
  
  <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
    <p style="margin: 0 0 6px 0; color: #737784; font-size: 12px; text-transform: uppercase; font-weight: bold;">Full SMS Message Body</p>
    <p style="margin: 0; color: #c3c6d5; font-size: 13.5px; line-height: 1.5; font-style: italic;">"${smsText}"</p>
  </div>
`);

const generatePurchaseReceiptEmail = (method: string, amount: any, txId: string) => wrapEmailTemplate(`
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #483aac; margin: 0 0 10px 0; font-size: 26px; font-weight: 800;">Purchase Receipt 🧾</h1>
    <p style="color: #c3c6d5; font-size: 16px; margin: 0;">Thanks for your order.</p>
  </div>
  
  <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 10px; margin: 24px 0;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr>
        <td style="padding: 10px 0; color: #737784; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">Product/Service:</td>
        <td style="padding: 10px 0; color: #ffffff; text-align: right; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-weight: bold;">${method}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; color: #737784; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">Amount Paid:</td>
        <td style="padding: 10px 0; color: #483aac; text-align: right; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-weight: bold; font-size: 16px;">₦${Number(amount).toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; color: #737784;">ID:</td>
        <td style="padding: 10px 0; color: #737784; text-align: right; font-family: monospace;">${txId}</td>
      </tr>
    </table>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="https://discountzar.ng/dashboard" style="background: #483aac; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; display: inline-block;">Go to Dashboard</a>
  </div>
`);

const generateRefundEmail = (amount: any, method: string, reference: string) => wrapEmailTemplate(`
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #483aac; margin: 0 0 10px 0; font-size: 26px; font-weight: 800;">Wallet Refunded 🔄</h1>
    <p style="color: #c3c6d5; font-size: 16px; margin: 0;">Your funds have been credited back.</p>
  </div>
  
  <div style="background: rgba(72, 58, 172, 0.04); border: 1px solid rgba(72, 58, 172, 0.15); padding: 20px; border-radius: 10px; margin: 24px 0;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr>
        <td style="padding: 10px 0; color: #737784; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">Refund Amount:</td>
        <td style="padding: 10px 0; color: #483aac; text-align: right; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-weight: bold; font-size: 16px;">₦${Number(amount).toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; color: #737784; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">Service/Reason:</td>
        <td style="padding: 10px 0; color: #ffffff; text-align: right; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">${method}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; color: #737784;">ID:</td>
        <td style="padding: 10px 0; color: #737784; text-align: right; font-family: monospace;">${reference}</td>
      </tr>
    </table>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="https://discountzar.ng/dashboard" style="background: linear-gradient(135deg, #483aac 0%, #3366cc 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; display: inline-block;">Go to Dashboard</a>
  </div>
`);

const formatDetailsForEmail = (details: any): string => {
  if (!details) return "";
  
  // If it's an array (multiple items)
  if (Array.isArray(details)) {
    return details.map((item: any, idx: number) => {
      const itemNum = item.item_number || (idx + 1);
      const lines = Object.entries(item)
        .filter(([k]) => k !== "item_number" && k !== "status")
        .map(([key, value]) => `<strong>${key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}:</strong> ${value}`)
        .join("<br/>");
      return `<div style="margin-bottom: 12px; padding-bottom: 12px; ${idx < details.length - 1 ? 'border-bottom: 1px solid rgba(255,255,255,0.05);' : ''}">
        <span style="color: #483aac; font-weight: bold;">Item #${itemNum}</span><br/>
        ${lines}
      </div>`;
    }).join("");
  }
  
  // If it's a flat object (single item)
  if (typeof details === "object") {
    if (details.status && details.status !== "completed") {
      return `Order status: <strong>${details.status}</strong>. Credentials will be available shortly.`;
    }
    return Object.entries(details)
      .filter(([k]) => k !== "raw_response" && k !== "status")
      .map(([key, value]) => `<strong>${key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}:</strong> ${value}`)
      .join("<br/>");
  }
  
  return String(details);
};

const generateOrderEmail = (planName: string, quantity: number, cost: any, orderId: string, additionalDetails = null) => wrapEmailTemplate(`
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #483aac; margin: 0 0 10px 0; font-size: 26px; font-weight: 800;">Order Confirmed 🛒</h1>
    <p style="color: #c3c6d5; font-size: 16px; margin: 0;">Your purchase is complete.</p>
  </div>
  
  <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 10px; margin: 24px 0;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr>
        <td style="padding: 10px 0; color: #737784; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">Service:</td>
        <td style="padding: 10px 0; color: #ffffff; text-align: right; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-weight: bold;">${planName}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; color: #737784; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">Quantity:</td>
        <td style="padding: 10px 0; color: #ffffff; text-align: right; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">${quantity}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; color: #737784;">Total Cost:</td>
        <td style="padding: 10px 0; color: #483aac; text-align: right; font-weight: bold; font-size: 16px;">₦${Number(cost).toLocaleString()}</td>
      </tr>
    </table>
  </div>
  
  ${additionalDetails ? `
  <div style="background: rgba(72, 58, 172, 0.04); border: 1px solid rgba(72, 58, 172, 0.2); padding: 18px; border-radius: 10px; margin-bottom: 20px;">
    <h3 style="margin: 0 0 12px 0; color: #483aac; font-size: 14px; text-transform: uppercase; font-weight: 700;">Order Details</h3>
    <div style="margin: 0; color: #e2e8f0; font-family: sans-serif; font-size: 13px; line-height: 1.6;">${formatDetailsForEmail(additionalDetails)}</div>
  </div>
  ` : ''}
  
  <p style="font-size: 14px; color: #737784; margin: 10px 0;">Order ID: ${orderId}</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="https://discountzar.ng/dashboard" style="background: #483aac; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; display: inline-block;">View Order History</a>
  </div>
`);


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("Received Webhook Payload:", payload);

    // Database webhooks typically send { type: "INSERT" | "UPDATE", table: "...", record: {...} }
    const { type, table, record, old_record } = payload;
    
    // Validate trigger type
    if (type !== "INSERT" && type !== "UPDATE") {
      return new Response(JSON.stringify({ message: "Ignored: Not an INSERT or UPDATE event" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let recipientEmail = null;
    let recipientName = "";
    let emailSubject = "";
    let emailHtml = "";

    // Helper to fetch user's email if not in the current record
    const fetchUserProfile = async (userId: string) => {
      const { data } = await supabase.from("profiles").select("email, full_name, username").eq("id", userId).single();
      return data;
    };

    if (type === "INSERT") {
      if (table === "profiles") {
        // Welcome Email
        recipientEmail = record.email;
        recipientName = record.username || record.full_name || "Valued Customer";
        emailSubject = "Welcome to discountzar.ng Plus!";
        emailHtml = generateWelcomeEmail(recipientName);

      } else if (table === "transactions") {
        const profile = await fetchUserProfile(record.user_id);
        if (profile && profile.email) {
          recipientEmail = profile.email;
          
          const isRefund = record.method?.toLowerCase().includes("refund") || record.type === "Refund";
          
          if (record.type === "Deposit" && !isRefund) {
            // Funding Email
            emailSubject = "Wallet Funded Successfully - discountzar.ng";
            emailHtml = generateFundingEmail(record.amount, record.id);

            // Also notify admins if this is a real deposit (not a welcome bonus)
            const isBonus = record.method?.toLowerCase().includes("bonus");

            if (!isBonus) {
              try {
                // Fetch admins
                const { data: admins } = await supabase
                  .from("profiles")
                  .select("email")
                  .eq("is_admin", true);

                const adminEmails = admins?.map(a => a.email).filter(Boolean) || [];

                if (adminEmails.length > 0) {
                  console.log("Notifying admins of deposit:", adminEmails);
                  const adminEmailHtml = generateAdminFundingEmail(profile, record.amount, record.method, record.id);

                  await fetch("https://api.sendbyte.africa/v1/emails", {
                    method: "POST",
                    headers: {
                      "Authorization": `Bearer ${SENDBYTE_API_KEY}`,
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      from: `discountzar.ng <${SENDER_EMAIL}>`,
                      to: adminEmails,
                      subject: `[Admin Alert] User Wallet Funded: ₦${Number(record.amount).toLocaleString()}`,
                      html: adminEmailHtml
                    })
                  });
                }
              } catch (adminErr) {
                console.error("Failed to notify admins of deposit:", adminErr);
              }
            }
          } else if (record.type === "Refund" || (record.type === "Deposit" && isRefund)) {
            // Refund Email
            emailSubject = "Refund Credited Successfully - discountzar.ng";
            emailHtml = generateRefundEmail(record.amount, record.method, record.id);
          } else if (record.type === "Purchase") {
            // Purchase Receipt Email
            emailSubject = "Purchase Receipt - discountzar.ng";
            emailHtml = generatePurchaseReceiptEmail(record.method, record.amount, record.id);
          }
        }
      } else if (table === "social_media_orders") {
        // SMM Order Notification Email
        const profile = await fetchUserProfile(record.user_id);
        if (profile && profile.email) {
          recipientEmail = profile.email;
          emailSubject = "Your discountzar.ng Order Receipt";
          
          const planName = record.plan_name || record.service_name || record.package_name || "Digital Service";
          const cost = record.cost || record.price || 0;
          const quantity = record.quantity || 1;
          
          emailHtml = generateOrderEmail(planName, quantity, cost, record.id, record.account_details);
        }
      } else if (table === "otp_orders") {
        // OTP Number Order Receipt
        const profile = await fetchUserProfile(record.user_id);
        if (profile && profile.email) {
          recipientEmail = profile.email;
          emailSubject = "Your Temporary OTP Number Assigned";
          emailHtml = generateOtpRequestedEmail(record.service, record.phone_number, record.server, record.price_ngn);
        }
      } else if (table === "virtual_wallets") {
        // Dedicated account generated
        const profile = await fetchUserProfile(record.user_id);
        if (profile && profile.email) {
          recipientEmail = profile.email;
          recipientName = profile.username || profile.full_name || "Customer";
          emailSubject = "Dedicated Funding Account Active - discountzar.ng";
          emailHtml = generateVirtualAccountEmail(recipientName, record.bank_name, record.account_number, record.account_name);
        }
      }
    } else if (type === "UPDATE") {
      if (table === "otp_orders") {
        // OTP Code Received (status changed PENDING -> COMPLETED)
        if (record.status === "COMPLETED" && (!old_record || old_record.status !== "COMPLETED") && record.otp_code) {
          const profile = await fetchUserProfile(record.user_id);
          if (profile && profile.email) {
            recipientEmail = profile.email;
            emailSubject = `Your ${record.service} Verification Code has Arrived!`;
            emailHtml = generateOtpReceivedEmail(record.service, record.phone_number, record.otp_code, record.sms_text || "");
          }
        }
      }
    }

    // Dispatch the email via SendByte if we have a recipient and HTML content
    if (recipientEmail && emailHtml) {
      console.log(`Sending email to ${recipientEmail} for event on table ${table}...`);
      
      const sendbyteReq = await fetch("https://api.sendbyte.africa/v1/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${SENDBYTE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: `discountzar.ng <${SENDER_EMAIL}>`,
          to: recipientEmail,
          subject: emailSubject,
          html: emailHtml
        })
      });

      const sendbyteRes = await sendbyteReq.json();
      
      if (!sendbyteReq.ok) {
        console.error("SendByte API Error:", sendbyteRes);
        throw new Error(`SendByte Error: ${sendbyteRes.message}`);
      }

      return new Response(JSON.stringify({ success: true, message: "Email dispatched", resend_id: sendbyteRes.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: "Ignored: No suitable recipient or email content" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Webhook Handler Error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
