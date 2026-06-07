import type { NextConfig } from "next";

const hostOf = (url?: string) => {
  try {
    return url ? new URL(url).hostname : undefined;
  } catch {
    return undefined;
  }
};

const r2Host = hostOf(process.env.NEXT_PUBLIC_R2_PUBLIC_URL);
const supabaseHost = hostOf(process.env.NEXT_PUBLIC_SUPABASE_URL);

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      // Cloudflare R2 — primary image host (zero egress).
      ...(r2Host
        ? [{ protocol: "https" as const, hostname: r2Host, pathname: "/**" }]
        : []),
      // Supabase Storage — legacy, kept until image migration is complete.
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
