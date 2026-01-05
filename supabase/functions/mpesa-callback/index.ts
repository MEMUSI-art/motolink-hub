import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MpesaCallback {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const callback: MpesaCallback = await req.json();
    console.log("M-Pesa callback received:", JSON.stringify(callback, null, 2));

    const { stkCallback } = callback.Body;
    const { ResultCode, ResultDesc, CheckoutRequestID, MerchantRequestID } = stkCallback;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (ResultCode === 0) {
      // Payment successful
      const metadata = stkCallback.CallbackMetadata?.Item || [];
      const amount = metadata.find(i => i.Name === "Amount")?.Value;
      const mpesaReceipt = metadata.find(i => i.Name === "MpesaReceiptNumber")?.Value;
      const phone = metadata.find(i => i.Name === "PhoneNumber")?.Value;

      console.log("Payment successful:", { amount, mpesaReceipt, phone });

      // You could update a payments table here
      // await supabase.from('payments').update({ status: 'completed', mpesa_receipt: mpesaReceipt }).eq('checkout_id', CheckoutRequestID);

    } else {
      // Payment failed
      console.log("Payment failed:", ResultDesc);
    }

    // M-Pesa expects a simple acknowledgment
    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Callback error:", error);
    return new Response(
      JSON.stringify({ ResultCode: 1, ResultDesc: error.message }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
