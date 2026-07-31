import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

const ACCSBULK_API_KEY = Deno.env.get("ACCSBULK_API_KEY") || "acb_nTOOqP9wIfiRFIoYpyDShdtJvNpsRrIRPPgUPBnJFwS6JCSe";
const ACCSBULK_BASE_URL = "https://accsbulk.com/api/v1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to translate common terms to English
const translateToEnglish = (text: string) => {
  if (!text) return text;
  
  let result = text.normalize("NFC");
  
  const map: Record<string, string> = {
    'Học Tập': 'Learning',
    'Giải trí': 'Entertainment',
    'Làm việc': 'Work',
    'Tiện ích': 'Utility',
    'Tài khoản': 'Account',
    'Tháng': 'Month',
    'Năm': 'Year',
    'Ngày': 'Days',
    'Gia hạn': 'Renewal',
    'Nâng cấp': 'Upgrade',
    'Chính chủ': 'Official',
    'Bảo hành': 'Warranty',
    'Vĩnh viễn': 'Lifetime',
    'Mật khẩu': 'Password',
    'xác minh danh tính': 'Identity Verified',
    'xác minh': 'Verified',
    'xác thực': 'Authenticated',
    'đã kháng': 'Appealed/Reinstated',
    'kháng ads': 'Ads Appealed',
    'kháng': 'Appealed',
    'chất lượng': 'Quality',
    'quốc gia': 'Country',
    'ngẫu nhiên': 'Random',
    'định dạng': 'Format',
    'bạn bè': 'Friends',
    'bè': 'Friends',
    'theo dõi': 'Followers',
    'lọc': 'Filtered',
    'sạch': 'Clean',
    'quảng cáo': 'Ads',
    'bảo mật': 'Security/2FA',
    'mã': 'Code',
    'khôi phục': 'Recovery',
    'ảo': 'Virtual',
    'chưa': 'Not',
    'đã': 'Already/Yes',
    'quét': 'Scanned',
    'sở hữu': 'Owned',
    'tạo': 'Created',
    'thanh toán': 'Payment',
    'thẻ': 'Card',
    'giá': 'Price',
    'rẻ': 'Cheap',
    'sỉ': 'Wholesale',
    'lẻ': 'Retail',
    'loại': 'Type',
    'dưới': 'Under',
    'trên': 'Above',
    'kho': 'Stock',
    'hết hàng': 'Out of Stock',
    'còn hàng': 'In Stock',
    'bao': 'Guarantee',
    'lỗi': 'Error',
    'đổi': 'Change/Replace',
    'hoàn tiền': 'Refund',
    'hỗ trợ': 'Support',
    'giờ': 'Hours',
    'phút': 'Minutes',
    'giây': 'Seconds',
    'Việt Nam': 'Vietnam',
    'Ngoại': 'Foreign/International',
    'Cổ': 'Aged',
    'Mới': 'New',
    'Siêu cổ': 'Super Aged',
    'Mỹ': 'USA',
    'Anh': 'UK',
    'Pháp': 'France',
    'Đức': 'Germany',
    'Nga': 'Russia',
    'Trung Quốc': 'China',
    'Thái Lan': 'Thailand',
    'Ấn Độ': 'India',
    'Philippines': 'Philippines',
    'Indonesia': 'Indonesia',
    'Campuchia': 'Cambodia',
    'Lào': 'Laos',
    'Thường': 'Regular/Standard',
    'Cá nhân': 'Personal',
    'Doanh nghiệp': 'Business',
    'Đại lý': 'Reseller',
    'Vnd': 'VND',
    'Đồng': 'Dong',
    'Giá rẻ': 'Budget/Cheap',
    'Cao cấp': 'Premium',
    'Hạn': 'Limit/Expiry',
    'Khóa': 'Locked/Blocked',
    'Mở khóa': 'Unlocked',
    'Liên kết': 'Linked',
    'Không': 'No/Without',
    'Có': 'Yes/With',
    'Bao gồm': 'Including',
    'Yêu cầu': 'Required',
    'Tự động': 'Automatic',
    'Thủ công': 'Manual',
    'Nhanh': 'Fast',
    'Chậm': 'Slow',
    'Ổn định': 'Stable',
    'Hệ thống': 'System',
    'Hỗ trợ 24/7': '24/7 Support',
    'Thông tin': 'Information/Details',
    'Tên': 'Name',
    'Tuổi': 'Age',
    'Giới tính': 'Gender',
    'Nam': 'Male',
    'Nữ': 'Female',
    'không đủ tiền': 'insufficient balance',
    'Số dư không đủ': 'insufficient balance',
    'Tài khoản không đủ': 'insufficient balance'
  };

  const sortedKeys = Object.keys(map).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(escapedKey, "gi");
    result = result.replace(regex, (match) => {
      const replacement = map[key];
      if (match === match.toUpperCase()) {
        return replacement.toUpperCase();
      }
      if (match[0] === match[0].toUpperCase()) {
        return replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }
      return replacement;
    });
  }

  return result;
};

// Helper to parse delivery items (like email:password or pipe separated structures) into structured objects
const parseAccsbulkAccount = (accountStr: string): Record<string, string> => {
  const parts: Record<string, string> = {};
  if (!accountStr) return parts;

  // Try parsing by pipe | first (fallback support for mixed formatting)
  if (accountStr.includes('|')) {
    const segments = accountStr.split('|');
    segments.forEach((seg: string) => {
      const colonIdx = seg.indexOf(':');
      if (colonIdx > 0) {
        let key = seg.substring(0, colonIdx).trim();
        const val = seg.substring(colonIdx + 1).trim();
        if (key && val) {
          const lowerKey = key.toLowerCase();
          if (lowerKey === 'tài khoản' || lowerKey === 'tai khoan' || lowerKey === 'username' || lowerKey === 'user' || lowerKey === 'login') {
            key = 'Username/Email';
          } else if (lowerKey === 'mật khẩu' || lowerKey === 'mat khau' || lowerKey === 'pass') {
            key = 'Password';
          } else if (lowerKey === 'mã bảo mật' || lowerKey === '2fa' || lowerKey === 'code' || lowerKey === 'mã 2fa') {
            key = '2FA Backup Key';
          } else {
            key = translateToEnglish(key);
          }
          parts[key] = val;
        }
      }
    });
    if (Object.keys(parts).length > 0) {
      return parts;
    }
  }

  // Split by colon :
  const segments = accountStr.split(':');
  if (segments.length >= 2) {
    parts['Username/Email'] = segments[0].trim();
    parts['Password'] = segments[1].trim();
    if (segments.length > 2) {
      parts['Additional Info / 2FA'] = segments.slice(2).map(s => s.trim()).join(' : ');
    }
  } else {
    parts['Details'] = accountStr.trim();
  }
  return parts;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { action, payload } = await req.json();

    let user: any = null;
    if (action === "buy" || action === "status") {
      // Get the user making the request
      const {
        data: { user: authUser },
        error: userError,
      } = await supabaseClient.auth.getUser();

      if (userError || !authUser) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      user = authUser;
    }

    if (action === "products") {
      let products = [];
      try {
        if (!ACCSBULK_API_KEY) throw new Error("No API Key");

        // 1. Fetch categories to get category image mapping
        const catResponse = await fetch(`${ACCSBULK_BASE_URL}/categories`, {
          method: "GET",
          headers: {
            "X-API-Key": ACCSBULK_API_KEY,
          },
        });
        
        const catImageMap: Record<number, string> = {};
        if (catResponse.ok) {
          const catData = await catResponse.json();
          if (catData.success && Array.isArray(catData.data)) {
            catData.data.forEach((cat: any) => {
              if (cat.id && cat.image) {
                catImageMap[cat.id] = cat.image;
              }
            });
          }
        }

        // 2. Fetch page 1 first to get total pages count
        const response = await fetch(`${ACCSBULK_BASE_URL}/listings?per_page=100`, {
          method: "GET",
          headers: {
            "X-API-Key": ACCSBULK_API_KEY,
          },
        });
        
        if (response.ok) {
          const firstPageData = await response.json();
          if (firstPageData.success && Array.isArray(firstPageData.data)) {
            let rawProducts = [...firstPageData.data];
            const lastPage = firstPageData.meta?.last_page || 1;

            // Fetch remaining pages in parallel
            if (lastPage > 1) {
              const promises = [];
              for (let p = 2; p <= lastPage; p++) {
                promises.push(
                  fetch(`${ACCSBULK_BASE_URL}/listings?per_page=100&page=${p}`, {
                    method: "GET",
                    headers: {
                      "X-API-Key": ACCSBULK_API_KEY,
                    },
                  }).then(async (r) => {
                    if (r.ok) {
                      const resJson = await r.json();
                      return resJson.data || [];
                    }
                    return [];
                  })
                );
              }
              const results = await Promise.all(promises);
              results.forEach((pageData) => {
                rawProducts = rawProducts.concat(pageData);
              });
            }

            // Map all AccsBulk listings to our format
            products = rawProducts.map((p: any) => {
              const categoryImage = (catImageMap[p.category?.id] || p.category?.image || "").replace(/ /g, "%20");
              const previewUrl = `https://accsbulk.com/listings/${p.slug}`;

              return {
                id: p.id,
                category: translateToEnglish(p.category?.title || "General"),
                name: translateToEnglish(p.title),
                slug: p.slug,
                image: categoryImage,
                price: (Number(p.price) || 0) * 25400,
                stock: p.available_stock || 0,
                description: translateToEnglish(p.title),
                preview: previewUrl
              };
            });
          }
        } else {
          throw new Error("Failed to fetch products from AccsBulk");
        }
      } catch (err) {
        console.warn("Falling back to simulated products", err);
        products = [
          { id: 18, category: "Facebook", name: "Facebook Aged Account", price: 5000, stock: 120, description: "Aged FB account.", image: "https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" },
          { id: 19, category: "Instagram", name: "Instagram + 100 Followers", price: 2500, stock: 300, description: "Email verified.", image: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" }
        ];
      }

      // Keep raw provider price (markup is added dynamically in frontend)
      products = products.map((p: any) => ({ ...p, price: p.price }));

      return new Response(JSON.stringify({ success: true, products }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "product_detail") {
      const { slug } = payload;
      if (!slug) {
        return new Response(JSON.stringify({ success: false, error: "Missing slug" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      try {
        if (!ACCSBULK_API_KEY) throw new Error("No API Key");
        const response = await fetch(`${ACCSBULK_BASE_URL}/listings/${slug}`, {
          method: "GET",
          headers: {
            "X-API-Key": ACCSBULK_API_KEY,
          },
        });
        if (response.ok) {
          const resData = await response.json();
          if (resData.success && resData.data) {
            const detail = {
              description: translateToEnglish(resData.data.description || "")
            };
            return new Response(JSON.stringify({ success: true, detail }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
        throw new Error("Failed to fetch product details from AccsBulk");
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

    } else if (action === "buy") {
      const { plan_id, plan_name, quantity, cost } = payload;

      const { data: profile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("wallet_balance, email")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        return new Response(JSON.stringify({ success: false, error: "Failed to load wallet balance" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (profile.wallet_balance < cost) {
        return new Response(JSON.stringify({ success: false, error: "Insufficient wallet balance" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 2. Process Purchase & Deduct Balance atomically via DB Function
      const newBalance = profile.wallet_balance - cost;
      const { data: purchaseSuccessResult, error: purchaseError } = await supabaseAdmin.rpc("process_purchase", {
        p_user_id: user.id,
        p_amount: cost,
        p_type: "Purchase",
        p_method: `Social: ${plan_name} (x${quantity})`
      });

      if (purchaseError) {
        return new Response(JSON.stringify({ success: false, error: purchaseError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 4. Place order with AccsBulk
      let orderResult = null;
      try {
        const response = await fetch(`${ACCSBULK_BASE_URL}/purchase`, {
          method: "POST",
          headers: {
            "X-API-Key": ACCSBULK_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ad_id: Number(plan_id),
            quantity: Number(quantity)
          })
        });

        if (response.ok) {
          orderResult = await response.json();
          console.log("AccsBulk order response:", JSON.stringify(orderResult));
          if (orderResult && orderResult.success === false) {
            throw new Error(orderResult.message || "AccsBulk purchase failed");
          }
        } else {
          console.error("AccsBulk API Order Error:", response.status, await response.text());
          throw new Error("AccsBulk purchase failed");
        }
      } catch (err) {
        console.warn("AccsBulk error, refunding user:", err);
        // Refund User atomically via DB Function
        const refundTxId = `tx-ref-${crypto.randomUUID().replace(/-/g, '').substring(0, 8)}`;
        await supabaseAdmin.rpc("process_deposit", {
          p_tx_id: refundTxId,
          p_user_id: user.id,
          p_amount: cost,
          p_method: `Refund: Failed to purchase ${plan_name}`
        });

        const errMsg = err.message || '';
        let userFriendlyError = "Failed to place order with provider. You have been refunded.";
        if (
          errMsg.toLowerCase().includes('insufficient') ||
          errMsg.toLowerCase().includes('balance') ||
          errMsg.toLowerCase().includes('money') ||
          errMsg.toLowerCase().includes('fund')
        ) {
          userFriendlyError = "This service is currently unavailable on this server. Please try using another server.";
        }

        return new Response(JSON.stringify({ success: false, error: userFriendlyError }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const purchaseData = orderResult?.data || {};
      const transId = purchaseData.order_id || null;
      const deliveryItems = purchaseData.accounts || [];

      // Build account_details as a structured object
      let accountDetails: any;
      if (deliveryItems.length === 1) {
        accountDetails = parseAccsbulkAccount(deliveryItems[0]);
      } else if (deliveryItems.length > 1) {
        accountDetails = deliveryItems.map((item: string, idx: number) => ({
          item_number: idx + 1,
          ...parseAccsbulkAccount(item)
        }));
      } else {
        accountDetails = { status: "completed", raw_response: purchaseData };
      }

      // 6. Insert into social_media_orders table
      const orderId = crypto.randomUUID();
      const { data: orderRecord, error: orderInsertError } = await supabaseAdmin
        .from("social_media_orders")
        .insert({
          id: orderId,
          user_id: user.id,
          plan_id: plan_id,
          plan_name: plan_name,
          quantity: quantity,
          cost: cost,
          status: "completed",
          account_details: accountDetails,
          ologstore_order_id: transId ? String(transId) : `local_${Date.now()}`
        })
        .select()
        .single();

      if (orderInsertError) {
         console.error("Failed to insert order record", orderInsertError);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Order placed successfully!", 
        order: orderRecord,
        newBalance
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "status") {
      const { trans_id } = payload;
      if (!trans_id) {
        return new Response(JSON.stringify({ success: false, error: "Missing trans_id" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Query AccsBulk status API
      const response = await fetch(`${ACCSBULK_BASE_URL}/orders/${trans_id}`, {
        method: "GET",
        headers: {
          "X-API-Key": ACCSBULK_API_KEY,
        },
      });

      if (!response.ok) {
        console.error("AccsBulk status error:", response.status, await response.text());
        return new Response(JSON.stringify({ success: false, error: "Failed to fetch status from AccsBulk" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const statusResult = await response.json();
      console.log("AccsBulk status query response:", JSON.stringify(statusResult));

      const orderData = statusResult?.data || {};
      const deliveryItems = orderData.accounts || [];

      // Parse delivery items
      let accountDetails: any;
      if (deliveryItems && deliveryItems.length > 0) {
        if (deliveryItems.length === 1) {
          accountDetails = parseAccsbulkAccount(deliveryItems[0]);
        } else {
          accountDetails = deliveryItems.map((item: string, idx: number) => ({
            item_number: idx + 1,
            ...parseAccsbulkAccount(item)
          }));
        }
      }

      // Update in the database
      const updateData: any = { status: "completed" };
      if (accountDetails) {
        updateData.account_details = accountDetails;
      }

      const { data: updatedOrder, error: updateError } = await supabaseAdmin
        .from("social_media_orders")
        .update(updateData)
        .eq("ologstore_order_id", trans_id)
        .select()
        .single();

      if (updateError) {
        console.error("Failed to update order status in DB:", updateError);
        return new Response(JSON.stringify({ success: false, error: "Failed to update order in database" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        order: updatedOrder
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
