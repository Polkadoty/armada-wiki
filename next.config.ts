import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/', destination: '/rulings', permanent: false },
      // The rulings used to be pre-rendered HTML files under public/rulings/. Keep their
      // URLs working: browsers carry a `#card-anchor` across a redirect, and the new
      // pages keep the same anchor ids.
      { source: '/rulings/index.html', destination: '/rulings', permanent: true },
      { source: '/rulings/upgrades.html', destination: '/rulings/upgrades', permanent: true },
      // Veteran upgrades were Legacy content, which the rulings no longer cover.
      { source: '/rulings/upgrades/veteran.html', destination: '/rulings/upgrades', permanent: true },
      { source: '/rulings/upgrades/:type.html', destination: '/rulings/upgrades/:type', permanent: true },
      { source: '/rulings/:section.html', destination: '/rulings/:section', permanent: true },
    ];
  },
};

export default nextConfig;
