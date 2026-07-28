import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // `/rulings/` is normalised to `/rulings` by Next before the rewrite below runs.
      { source: '/', destination: '/rulings', permanent: false },
    ];
  },
  async rewrites() {
    return [
      // The rulings book is pre-rendered into `public/rulings/`. Next serves public
      // files by exact path only, so `/rulings` needs to be mapped to the index file
      // explicitly — otherwise the redirect above lands on a 404.
      { source: '/rulings', destination: '/rulings/index.html' },
    ];
  },
};

export default nextConfig;
