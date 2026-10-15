import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Browser-side safety rules, sent with every page (security review F-03).
// Nothing here costs speed: they are a few bytes of headers.
//   * script-src keeps 'unsafe-inline' because Next.js and our theme
//     script use inline scripts; 'unsafe-eval' is allowed in dev only.
//   * connect-src / img-src allow our Supabase project (data, uploads).
//   * frame-ancestors 'none' stops other sites putting us in a frame
//     (clickjacking).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co",
  "font-src 'self' data:",
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co${isDev ? " ws://localhost:* http://localhost:*" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // HTTPS only (browsers ignore it on http://localhost). No "preload":
  // that is very hard to undo.
  ...(isDev
    ? []
    : [{ key: "Strict-Transport-Security", value: "max-age=31536000" }]),
];

const nextConfig: NextConfig = {
  // Do not announce "X-Powered-By: Next.js" on every response.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // The roster upload sends a file (up to 1 MB) to a Server Action. The
  // default request limit is exactly 1 MB, which leaves no room for the
  // form wrapper around the file, so raise it a little.
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
  },
  // Cache Components and Partial Prefetching are deliberately OFF.
  //
  // With them on, any page that reads from the database (or uses
  // cookies, headers or searchParams) fails the build unless it is
  // wrapped in <Suspense> or marked with "use cache". That is a fine
  // trade for a production team tuning performance; for a team writing
  // its first database query it is an opaque build error at exactly
  // the wrong moment.
  //
  // Turn them back on later if you want them, and read:
  // https://nextjs.org/docs/messages/blocking-prerender-dynamic
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
