import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // The Atlas is now the Trips home; preserve old /trips/atlas links.
    return [{ source: '/trips/atlas', destination: '/trips', permanent: true }];
  },
};

export default nextConfig;
