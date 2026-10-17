import './globals.css';
import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import { ProgressProvider } from '@/context/ProgressContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Analytics } from '@vercel/analytics/react';

// Self-hosted at build time: no render-blocking request to Google Fonts on page load
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap'});
const fraunces = Fraunces({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-display', display: 'swap'});

// Runs before the page paints so the saved theme is applied without a flash. Light is the default.
const themeScript = `(function(){try{var t=localStorage.getItem('prodpath_theme')||localStorage.getItem('pm_hub_theme');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`;

export const metadata: Metadata = {
  title: {
    default: 'ProdPath | Learn Product Management in 5 Weeks',
    template: '%s | ProdPath',
  },
  description: 'A free, structured 5-week product management learning path with an AI PM track. Track your progress across devices.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any'},
      { url: '/icon.svg', type: 'image/svg+xml'},
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32'},
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16'},
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png'},
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning: the theme script may add the "dark"class before React loads
    <html lang="en"className={`scroll-smooth ${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased flex flex-col min-h-screen relative bg-paper text-ink transition-colors duration-200">
        <ProgressProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
            {children}
          </main>
          <Footer />
        </ProgressProvider>
        <Analytics />
      </body>
    </html>
  );
}
