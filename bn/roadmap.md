# Visit Tracker — Setup Guide

A 3-part system: **Supabase** (database) + **Cloudflare Worker** (API) + **tracker.js** (frontend).
Estimated setup time: ~20 minutes.

---

## Part 1 — Supabase (Database)

1. Go to [supabase.com](https://supabase.com) and create a free account.
2. Click **New project**, give it a name (e.g. `my-site-analytics`), set a password, choose a region.
3. Once the project is ready, go to **SQL Editor** (left sidebar).
4. Paste the entire contents of `supabase_schema.sql` and click **Run**.
5. Go to **Project Settings → API** and copy:
   - **Project URL** → you'll need this (e.g. `https://xyzxyz.supabase.co`)
   - **anon / public key** → you'll need this too

---

## Part 2 — Cloudflare Worker (API endpoint)

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) (free account).
2. In the left sidebar click **Workers & Pages → Create**.
3. Choose **Create Worker**, give it a name (e.g. `visit-tracker`), click **Deploy**.
4. Click **Edit code**, paste the contents of `worker/index.js`, and click **Deploy**.
5. Go to **Settings → Variables** and add these:

   | Variable name    | Value                              |
   |------------------|------------------------------------|
   | `SUPABASE_URL`   | Your Supabase project URL          |
   | `SUPABASE_KEY`   | Your Supabase anon/public key      |
   | `ALLOWED_ORIGIN` | Your site URL (e.g. `https://yourname.github.io`) |

6. Copy your Worker URL — it looks like:
   `https://visit-tracker.yourname.workers.dev`

---

## Part 3 — Frontend (tracker.js)

1. Open `tracker.js` and replace `YOUR_WORKER.YOUR_SUBDOMAIN.workers.dev`
   with your actual Worker URL from step 2.6.
2. Copy `tracker.js` into the root of your GitHub Pages repo.
3. Add this line to every HTML page just before `</body>`:
   ```html
   <script src="/tracker.js"></script>
   ```
4. Push to GitHub. Visits will start logging immediately.

---

## Part 4 — Dashboard

The dashboard (`dashboard/index.html`) is a standalone HTML file.
**You do not need to host it** — just open it locally in your browser.

On the login screen, enter:
- Your **Supabase URL**
- Your **anon key**
- The **email + password** of your Supabase account (the one you signed up with)

---

## What gets tracked

| Field        | Source                          |
|--------------|---------------------------------|
| Page URL     | `window.location.pathname`      |
| Referrer     | `document.referrer`             |
| Country      | Cloudflare's IP geolocation     |
| City         | Cloudflare's IP geolocation     |
| Device       | User-Agent parsing              |
| Browser      | User-Agent parsing              |
| OS           | User-Agent parsing              |
| Session ID   | Random UUID per browser session |
| Duration     | Time from page load to `visibilitychange` |

> **Privacy note:** No IP addresses are stored. Country is resolved by Cloudflare
> at the edge and only the country name is logged.

---

## Troubleshooting

**Visits aren't logging**
- Open browser DevTools → Network and look for a POST to your Worker URL.
- Check the Worker logs in Cloudflare dashboard → Workers → your worker → Logs.
- Make sure `ALLOWED_ORIGIN` matches your site's exact URL (no trailing slash).

**Dashboard shows "Error loading data"**
- Make sure you're using your Supabase **email login** credentials, not a third-party OAuth.
- Check that the SQL schema ran without errors (especially the RLS policies).

**Country shows null**
- This is normal in local development. Cloudflare only resolves geo in production.
