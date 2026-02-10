// frontend/next.config.ts
import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// English comment: If your browser fetches ONLY "/api/*" (same-origin),
// you usually don't need to allow backend origin in connect-src.
// Add real origins only if the browser directly calls them.
const CONNECT_SRC = ["'self'"].join(" ");

// English comment: Keep CSP in production. In dev it can break HMR.
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "img-src 'self' data:",
  "font-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline'",
  `connect-src ${CONNECT_SRC}`,
  "script-src 'self'",
].join("; ");

const securityHeaders = [
  // English comment: Apply CSP only in prod to avoid dev/HMR issues.
  ...(isProd ? [{ key: "Content-Security-Policy", value: CSP }] : []),

  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,

  async headers() {
    return [
      // English comment: All app routes (pages + API)
      { source: "/:path*", headers: securityHeaders },

      // English comment: Next internal assets (this is what scanners often hit)
      { source: "/_next/:path*", headers: securityHeaders },

      // English comment: common public files explicitly (robots/sitemap/etc)
      { source: "/robots.txt", headers: securityHeaders },
      { source: "/sitemap.xml", headers: securityHeaders },
      { source: "/favicon.ico", headers: securityHeaders },

      // English comment: if you serve flags from /public/flags/*
      { source: "/flags/:path*", headers: securityHeaders },
    ];
  },
};

export default nextConfig;
