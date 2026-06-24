/**
 * Visit Tracker — Cloudflare Worker
 *
 * Deploy at: https://dash.cloudflare.com → Workers & Pages → Create Worker
 *
 * Environment variables to set in Worker Settings → Variables:
 *   SUPABASE_URL    — e.g. https://xyzxyz.supabase.co
 *   SUPABASE_KEY    — your Supabase anon/public key
 *   ALLOWED_ORIGIN  — your GitHub Pages URL, e.g. https://yourname.github.io
 */

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    // ── CORS headers ────────────────────────────────────────────────
    const corsHeaders = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }

    // ── Parse body ──────────────────────────────────────────────────
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
    }

    const { page, referrer, session_id, duration_ms, device, browser, os } = body;

    if (!page || !session_id) {
      return new Response("Missing required fields", { status: 400, headers: corsHeaders });
    }

    // ── Geo from Cloudflare headers ─────────────────────────────────
    const country = request.cf?.country ?? null;
    const city    = request.cf?.city    ?? null;

    // ── Insert into Supabase ────────────────────────────────────────
    const supabaseRes = await fetch(`${env.SUPABASE_URL}/rest/v1/visits`, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "apikey":        env.SUPABASE_KEY,
        "Authorization": `Bearer ${env.SUPABASE_KEY}`,
        "Prefer":        "return=minimal",
      },
      body: JSON.stringify({
        page,
        referrer:    referrer    || null,
        session_id,
        duration_ms: duration_ms || null,
        device:      device      || null,
        browser:     browser     || null,
        os:          os          || null,
        country,
        city,
      }),
    });

    if (!supabaseRes.ok) {
      const err = await supabaseRes.text();
      console.error("Supabase error:", err);
      return new Response("Logging failed", { status: 502, headers: corsHeaders });
    }

    return new Response("ok", { status: 200, headers: corsHeaders });
  },
};
