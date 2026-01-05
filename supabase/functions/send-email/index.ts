import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  type: 'booking_confirmation' | 'service_confirmation' | 'newsletter_welcome';
  data: {
    name?: string;
    bikeName?: string;
    pickupDate?: string;
    returnDate?: string;
    pickupLocation?: string;
    totalPrice?: number;
    serviceName?: string;
    preferredDate?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    console.error("RESEND_API_KEY not configured");
    return new Response(
      JSON.stringify({ error: "Email service not configured" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const resend = new Resend(resendKey);

  try {
    const { to, type, data }: EmailRequest = await req.json();

    let subject = "";
    let html = "";

    switch (type) {
      case 'booking_confirmation':
        subject = `🏍️ Booking Confirmed - ${data.bikeName}`;
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">MotoLink Africa</h1>
            </div>
            <div style="padding: 30px; background: #1a1a1a; color: #ffffff;">
              <h2 style="color: #f97316;">Booking Confirmed! 🎉</h2>
              <p>Hey ${data.name || 'Rider'},</p>
              <p>Your motorcycle rental has been confirmed. Here are the details:</p>
              <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Bike:</strong> ${data.bikeName}</p>
                <p><strong>Pickup Date:</strong> ${data.pickupDate}</p>
                <p><strong>Return Date:</strong> ${data.returnDate}</p>
                <p><strong>Location:</strong> ${data.pickupLocation}</p>
                <p style="font-size: 1.2em; color: #f97316;"><strong>Total:</strong> KES ${data.totalPrice?.toLocaleString()}</p>
              </div>
              <p>Bring a valid ID and your driving license when picking up the bike.</p>
              <p>Ride safe! 🏍️</p>
              <p>— The MotoLink Team</p>
            </div>
          </div>
        `;
        break;

      case 'service_confirmation':
        subject = `🔧 Service Appointment Confirmed`;
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">MotoLink Africa</h1>
            </div>
            <div style="padding: 30px; background: #1a1a1a; color: #ffffff;">
              <h2 style="color: #f97316;">Service Appointment Confirmed! 🔧</h2>
              <p>Hey ${data.name || 'Rider'},</p>
              <p>Your service appointment has been scheduled:</p>
              <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Service:</strong> ${data.serviceName}</p>
                <p><strong>Date:</strong> ${data.preferredDate}</p>
                <p style="font-size: 1.2em; color: #f97316;"><strong>Estimated Cost:</strong> KES ${data.totalPrice?.toLocaleString()}</p>
              </div>
              <p>Our mechanic will contact you to confirm the time.</p>
              <p>— The MotoLink Team</p>
            </div>
          </div>
        `;
        break;

      case 'newsletter_welcome':
        subject = `Welcome to MotoLink Africa! 🏍️`;
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">MotoLink Africa</h1>
            </div>
            <div style="padding: 30px; background: #1a1a1a; color: #ffffff;">
              <h2 style="color: #f97316;">Welcome to the Ride! 🎉</h2>
              <p>Hey ${data.name || 'Rider'},</p>
              <p>You're now part of the MotoLink community. Get ready for:</p>
              <ul>
                <li>🏍️ Exclusive bike rental deals</li>
                <li>🔧 Service discounts</li>
                <li>📍 New location announcements</li>
                <li>🏆 Rider tips and stories</li>
              </ul>
              <p>Visit our website to explore our fleet!</p>
              <p>Ride safe! 🏍️</p>
              <p>— The MotoLink Team</p>
            </div>
          </div>
        `;
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Invalid email type" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
    }

    const emailResponse = await resend.emails.send({
      from: "MotoLink Africa <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    console.log("Email sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, id: emailResponse.data?.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Email error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
