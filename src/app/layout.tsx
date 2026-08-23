import './globals.css';
import type { Metadata } from 'next';
import { ProgressProvider } from '@/context/ProgressContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import LiquidEtherWrapper from '@/components/LiquidEtherWrapper';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: {
    default: 'ProdPath • Personal Product Management Tracker',
    template: '%s | ProdPath',
  },
  description: 'Self-contained, trackable 5-week Product Management learning tracker with cloud progress sync.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="antialiased selection:bg-violet-600 selection:text-white flex flex-col min-h-screen relative bg-[#faf9f6] dark:bg-[#0a0a0f] text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
        <LiquidEtherWrapper />

        <ProgressProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
            {children}
          </main>
          <Footer />
        </ProgressProvider>
        <Analytics />
      </body>
    </html>
  );
}

