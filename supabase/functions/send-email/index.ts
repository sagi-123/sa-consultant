// Supabase Edge Function: send-email
// Sends email via Gmail SMTP using denomailer (no domain verification needed)
// Required Supabase Secrets:
//   GMAIL_USER       = sajaruthmahjabeen@gmail.com
//   GMAIL_APP_PASS   = 16-character Google App Password

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.json();
    console.log("📧 send-email payload:", payload);

    if (!payload.recipients || !payload.subject || (!payload.text && !payload.html)) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: recipients, subject, and text or html" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GMAIL_USER = Deno.env.get("GMAIL_USER");
    const GMAIL_APP_PASS = Deno.env.get("GMAIL_APP_PASS");

    if (!GMAIL_USER || !GMAIL_APP_PASS) {
      console.error("❌ Missing GMAIL_USER or GMAIL_APP_PASS secrets");
      return new Response(
        JSON.stringify({ error: "Gmail credentials not configured in Supabase secrets" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: {
          username: GMAIL_USER,
          password: GMAIL_APP_PASS,
        },
      },
      debug: {
        encodeLB: true,
      },
    });

    let { recipients, subject, text, html } = payload;

    if (html) {
      // Remove all carriage returns/line feeds and collapse multiple spaces to prevent Quoted-Printable "=20" or "=0D" artifacts
      html = html
        .replace(/\r?\n|\r/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    if (text) {
      // Remove trailing whitespace from each line to prevent trailing space "=20" encodings
      text = text
        .split(/\r?\n/)
        .map((line: string) => line.trimEnd())
        .join("\n");
    }

    await client.send({
      from: `SA Consultant & Staffing <${GMAIL_USER}>`,
      to: recipients,
      subject,
      content: text ?? "Please view this email in an HTML-capable email client.",
      html: html ?? undefined,
    });

    await client.close();

    console.log("✅ Email sent via Gmail SMTP to:", recipients);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("❌ Error in send-email function:", e);
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
