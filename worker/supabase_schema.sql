-- ============================================================
--  Visit Tracker — Supabase Schema
--  Run this in your Supabase project's SQL Editor
-- ============================================================

-- 1. Visits table
CREATE TABLE visits (
  id          BIGSERIAL PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  page        TEXT        NOT NULL,          -- e.g. "/about"
  referrer    TEXT,                          -- where they came from
  country     TEXT,                          -- resolved from CF header
  city        TEXT,
  device      TEXT,                          -- "mobile" | "desktop" | "tablet"
  browser     TEXT,                          -- "Chrome" | "Firefox" etc.
  os          TEXT,                          -- "Windows" | "macOS" etc.
  session_id  TEXT,                          -- random UUID per session
  duration_ms INTEGER                        -- time on page in ms (sent on leave)
);

-- 2. Index for fast dashboard queries
CREATE INDEX visits_created_at_idx ON visits (created_at DESC);
CREATE INDEX visits_page_idx       ON visits (page);
CREATE INDEX visits_country_idx    ON visits (country);

-- 3. Enable Row Level Security
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- 4. Allow the Cloudflare Worker (anon key) to INSERT only
CREATE POLICY "worker_insert" ON visits
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 5. Allow only authenticated users (you) to SELECT
CREATE POLICY "owner_select" ON visits
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
--  Convenience views for the dashboard
-- ============================================================

-- Total visits per page
CREATE VIEW page_counts AS
  SELECT page, COUNT(*) AS visits
  FROM visits
  GROUP BY page
  ORDER BY visits DESC;

-- Visits per day (last 30 days)
CREATE VIEW daily_visits AS
  SELECT DATE(created_at) AS day, COUNT(*) AS visits
  FROM visits
  WHERE created_at >= NOW() - INTERVAL '30 days'
  GROUP BY day
  ORDER BY day;

-- Top referrers
CREATE VIEW top_referrers AS
  SELECT
    COALESCE(referrer, 'direct') AS referrer,
    COUNT(*) AS visits
  FROM visits
  GROUP BY referrer
  ORDER BY visits DESC
  LIMIT 20;

-- Country breakdown
CREATE VIEW country_breakdown AS
  SELECT
    COALESCE(country, 'Unknown') AS country,
    COUNT(*) AS visits
  FROM visits
  GROUP BY country
  ORDER BY visits DESC;
