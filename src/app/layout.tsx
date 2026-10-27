import './globals.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { ProgressProvider } from '@/context/ProgressContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

// Bundled in src/assets/fonts (the Latin files Google Fonts serves, OFL licence), so builds never call Google.
// Inter is variable (100-900); Fraunces covers weights 500-700. Fallback fonts (Arial, Times New Roman) are unchanged.
const inter = localFont({
  src: '../assets/fonts/Inter-Latin.woff2',
  weight: '100 900',
  style: 'normal',
  variable: '--font-inter',
  display: 'swap',
  adjustFontFallback: 'Arial',
});
const fraunces = localFont({
  src: '../assets/fonts/Fraunces-Latin.woff2',
  weight: '500 700',
  style: 'normal',
  variable: '--font-display',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
});

// Runs before the page paints so the saved theme is applied without a flash. Light is the default.
// It also marks the page while its tab is hidden, so globals.css can pause the looping animations.
const themeScript = `(function(){try{var t=localStorage.getItem('prodpath_theme')||localStorage.getItem('pm_hub_theme');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}var d=document,h=function(){d.documentElement.toggleAttribute('data-tab-hidden',d.hidden)};h();d.addEventListener('visibilitychange',h);})();`;

const siteTitle = 'ProdPath | Learn Product Management in 5 Weeks';
const siteDescription =
  'A free, structured 5-week product management learning path with an AI PM track. Track your progress across devices.';

export const metadata: Metadata = {
  metadataBase: new URL('https://prodpath.vercel.app'),
  title: {
    default: siteTitle,
    template: '%s | ProdPath',
  },
  description: siteDescription,
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any'},
      { url: '/favicon.svg', type: 'image/svg+xml'},
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32'},
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16'},
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192'},
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512'},
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png'},
    ],
  },
  // The share image itself comes from app/opengraph-image.tsx and app/twitter-image.tsx
  openGraph: {
    type: 'website',
    siteName: 'ProdPath',
    title: siteTitle,
    description: siteDescription,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
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
      <body className="antialiased flex flex-col min-h-screen relative text-ink">
        <ProgressProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
            {children}
          </main>
          <Footer />
        </ProgressProvider>
        <Analytics />
        {/* Real visitors' page speed, shown in the Vercel dashboard */}
        <SpeedInsights />
      </body>
    </html>
  );
}
