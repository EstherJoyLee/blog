import NextConfig from "next";

const nextConfig: NextConfig = {
  /* config options here */
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

export default nextConfig;
