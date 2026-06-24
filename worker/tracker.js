/**
 * Visit Tracker — Frontend Snippet
 * Add this to every page of your GitHub Pages site,
 * just before </body>
 *
 * <script src="/tracker.js"></script>
 *   OR paste inline in a <script> tag.
 */

(function () {
  // ── Config ────────────────────────────────────────────────────────
  const WORKER_URL = "https://YOUR_WORKER.YOUR_SUBDOMAIN.workers.dev"; // ← change this

  // ── Helpers ───────────────────────────────────────────────────────
  function getOrCreateSession() {
    let id = sessionStorage.getItem("_vt_sid");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("_vt_sid", id);
    }
    return id;
  }

  function detectDevice() {
    const ua = navigator.userAgent;
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
      return /iPad|Tablet/i.test(ua) ? "tablet" : "mobile";
    }
    return "desktop";
  }

  function detectBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes("Firefox"))       return "Firefox";
    if (ua.includes("Edg"))           return "Edge";
    if (ua.includes("OPR"))           return "Opera";
    if (ua.includes("Chrome"))        return "Chrome";
    if (ua.includes("Safari"))        return "Safari";
    return "Other";
  }

  function detectOS() {
    const ua = navigator.userAgent;
    if (ua.includes("Windows"))  return "Windows";
    if (ua.includes("Mac OS X")) return "macOS";
    if (ua.includes("Linux"))    return "Linux";
    if (ua.includes("Android"))  return "Android";
    if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
    return "Other";
  }

  // ── Send visit ────────────────────────────────────────────────────
  const session_id  = getOrCreateSession();
  const startTime   = Date.now();
  const page        = window.location.pathname;
  const referrer    = document.referrer || null;

  const payload = {
    page,
    referrer,
    session_id,
    device:  detectDevice(),
    browser: detectBrowser(),
    os:      detectOS(),
  };

  // Use sendBeacon for reliability; fall back to fetch
  function sendVisit(extra = {}) {
    const body = JSON.stringify({ ...payload, ...extra });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(WORKER_URL, new Blob([body], { type: "application/json" }));
    } else {
      fetch(WORKER_URL, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {}); // silently ignore errors
    }
  }

  // Send on page load
  sendVisit();

  // Send duration when user leaves the page
  window.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      sendVisit({ duration_ms: Date.now() - startTime });
    }
  });
})();
