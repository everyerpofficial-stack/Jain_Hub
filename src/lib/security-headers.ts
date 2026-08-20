/**
 * security-headers.ts
 *
 * Security headers applied to every SSR response.
 *
 * These used to live in netlify.toml, which was never in effect: the app
 * deploys to Vercel, so the Netlify config was read by nobody and the live
 * site served none of them (only Vercel's own HSTS). Rather than port them to
 * vercel.json — Nitro emits a Build Output API v3 config whose `routes`
 * supersede vercel.json's routing block — they are set here, on the one
 * handler every HTML response passes through. That keeps them working on
 * whichever host the build targets, since Nitro picks its preset from the
 * platform's own env vars.
 *
 * Static assets under /assets/* are served straight from the filesystem and
 * never reach this handler; Nitro already gives them an immutable
 * cache-control entry in its generated route config.
 */

export const SECURITY_HEADERS: Record<string, string> = {
  // Clickjacking protection (frame-ancestors below covers modern browsers).
  "X-Frame-Options": "DENY",
  // Stop browsers guessing content types.
  "X-Content-Type-Options": "nosniff",
  // Don't leak full URLs to third parties.
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Force HTTPS for a year, subdomains included.
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  // Switch off browser APIs this app never uses.
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), interest-cohort=()",
  "X-XSS-Protection": "1; mode=block",
  // script-src needs 'unsafe-inline'/'unsafe-eval' for the SSR hydration
  // payload; connect-src must allow Apps Script or the Google Sheets sync
  // breaks; style/font-src cover the Google Fonts link in __root.tsx.
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://script.google.com https://script.googleusercontent.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ") + ";",
};

/**
 * Return `response` with the security headers attached.
 *
 * Some runtimes hand back a Response whose headers are immutable, so fall back
 * to rebuilding it. The body is passed through untouched, which keeps streamed
 * SSR responses streaming.
 */
export function withSecurityHeaders(response: Response): Response {
  try {
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      response.headers.set(key, value);
    }
    return response;
  } catch {
    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      headers.set(key, value);
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
}
