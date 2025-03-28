// next.config.mjs
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  images: {
    domains: [
      "firebasestorage.googleapis.com",
      "unsplash.com",
      "jyocikkjxnrtqdbzfvzd.supabase.co",
      "source.unsplash.com",
      "images.unsplash.com",
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
