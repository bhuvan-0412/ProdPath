/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  // The Schedule page became Activity; keep old links and bookmarks working
  async redirects() {
    return [{ source: '/schedule', destination: '/activity', permanent: true }];
  },
};

export default nextConfig;
