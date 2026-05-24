// Supabase Edge Function: send-email
// This function expects a POST request with JSON body:
// { recipients: string[], subject: string, text: string }
// It forwards the email using Resend API.
// Ensure you have RESEND_API_KEY in your environment variables.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
if (!RESEND_API_KEY) {
  console.error("RESEND_API_KEY not set in environment");
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
    // Use built-in JSON parser
    const payload = await req.json();
    console.log('Parsed payload:', payload);
    // Optional validation of required fields
    if (!payload.recipients || !payload.subject || (!payload.text && !payload.html)) {
      return new Response(JSON.stringify({ error: 'Missing required fields: recipients, subject, and either text or html body' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { recipients, subject, text, html } = payload;

    const emailData = {
      from: "SA Consultant & Staffing <no-reply@resend.dev>",
      to: recipients,
      subject,
      text,
      html,
    };
    const sendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });
    if (!sendRes.ok) {
      const errText = await sendRes.text();
      return new Response(JSON.stringify({ error: `Resend failed: ${sendRes.status} ${errText}` }), {
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
