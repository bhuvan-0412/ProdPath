/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  // The Schedule page became Activity; keep old links and bookmarks working
  async redirects() {
    return [
      { source: '/schedule', destination: '/activity', permanent: true },
      // Live Sessions is hidden until it's refilled as PM Talks; temporary so it can come back
      { source: '/live-sessions', destination: '/dashboard', permanent: false },
    ];
  },
};

export default nextConfig;
