/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  mdxRs: true,
  experimental: {
    mdxRs: true,
  },
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
}

module.exports = nextConfig 