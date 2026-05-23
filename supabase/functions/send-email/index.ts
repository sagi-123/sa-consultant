// Supabase Edge Function: send-email
// This function expects a POST request with JSON body:
// { recipients: string[], subject: string, text: string }
// It forwards the email using SendGrid API.
// Ensure you have SENDGRID_API_KEY in your environment variables.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
if (!SENDGRID_API_KEY) {
  console.error("SENDGRID_API_KEY not set in environment");
}

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    // Handle preflight request
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  try {
    const { recipients, subject, text } = await req.json();
    const emailData = {
      personalizations: [{ to: recipients.map((email: string) => ({ email })), subject }],
      from: { email: "no-reply@yourdomain.com" },
      content: [{ type: "text/plain", value: text }],
    };
    const sendRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });
    if (!sendRes.ok) {
      const errText = await sendRes.text();
      return new Response(JSON.stringify({ error: `SendGrid failed: ${sendRes.status} ${errText}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error in send-email function:", e);
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
