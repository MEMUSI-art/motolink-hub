import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MpesaRequest {
  phone: string;
  amount: number;
  reference: string;
  description: string;
}

interface TokenResponse {
  access_token: string;
  expires_in: string;
}

interface StkPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check - require valid user session
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify user is authenticated
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { phone, amount, reference, description }: MpesaRequest = await req.json();

    // Verify the booking belongs to the authenticated user
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('user_id, total_price')
      .eq('id', reference)
      .single();

    if (bookingError || !booking) {
      console.error('Booking lookup error:', bookingError);
      return new Response(
        JSON.stringify({ error: 'Booking not found' }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (booking.user_id !== user.id) {
      console.error('Unauthorized booking access attempt:', { userId: user.id, bookingUserId: booking.user_id });
      return new Response(
        JSON.stringify({ error: 'Unauthorized - booking does not belong to you' }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify amount matches (with small tolerance for rounding)
    if (Math.abs(amount - Number(booking.total_price)) > 1) {
      console.error('Amount mismatch:', { requestedAmount: amount, bookingAmount: booking.total_price });
      return new Response(
        JSON.stringify({ error: 'Payment amount does not match booking total' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get M-Pesa credentials from environment
    const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY");
    const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET");
    const passkey = Deno.env.get("MPESA_PASSKEY");
    const shortcode = Deno.env.get("MPESA_SHORTCODE") || "174379"; // Sandbox default
    const callbackUrl = Deno.env.get("MPESA_CALLBACK_URL");

    if (!consumerKey || !consumerSecret || !passkey) {
      console.error("Missing M-Pesa credentials");
      return new Response(
        JSON.stringify({ 
          error: "M-Pesa not configured. Please add MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, and MPESA_PASSKEY secrets." 
        }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Determine environment (sandbox or production)
    const isSandbox = Deno.env.get("MPESA_ENVIRONMENT") !== "production";
    const baseUrl = isSandbox 
      ? "https://sandbox.safaricom.co.ke" 
      : "https://api.safaricom.co.ke";

    // Step 1: Get OAuth token
    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    const tokenResponse = await fetch(
      `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error("Token error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to authenticate with M-Pesa" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const tokenData: TokenResponse = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Step 2: Initiate STK Push
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T]/g, "")
      .slice(0, 14);
    
    const password = btoa(`${shortcode}${passkey}${timestamp}`);

    // Format phone number (remove leading 0 or +, ensure starts with 254)
    let formattedPhone = phone.replace(/\s+/g, "").replace(/^\+/, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.slice(1);
    }
    if (!formattedPhone.startsWith("254")) {
      formattedPhone = "254" + formattedPhone;
    }

    const stkPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl || `${supabaseUrl}/functions/v1/mpesa-callback`,
      AccountReference: reference.slice(0, 12), // Max 12 chars
      TransactionDesc: description.slice(0, 13), // Max 13 chars
    };

    console.log("STK Push payload for user:", user.id, "booking:", reference);

    const stkResponse = await fetch(
      `${baseUrl}/mpesa/stkpush/v1/processrequest`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stkPayload),
      }
    );

    const stkData: StkPushResponse = await stkResponse.json();
    console.log("STK Push response:", stkData);

    if (stkData.ResponseCode === "0") {
      return new Response(
        JSON.stringify({
          success: true,
          message: stkData.CustomerMessage,
          checkoutRequestId: stkData.CheckoutRequestID,
          merchantRequestId: stkData.MerchantRequestID,
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: stkData.ResponseDescription || "STK Push failed",
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
  } catch (error: any) {
    console.error("M-Pesa error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
