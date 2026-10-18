import { ImageResponse } from 'next/og';

const shareImageSize = { width: 1200, height: 630 };

// Share preview card used by app/opengraph-image.tsx and app/twitter-image.tsx:
// flat paper background, the logo mark, the name and one line.
// Fonts are bundled in src/assets/fonts (Latin subsets from Google Fonts, OFL licence).
export async function renderShareImage() {
  const [fraunces, inter] = await Promise.all([
    fetch(new URL('../assets/fonts/Fraunces-SemiBold.woff', import.meta.url)).then((res) => res.arrayBuffer()),
    fetch(new URL('../assets/fonts/Inter-Regular.woff', import.meta.url)).then((res) => res.arrayBuffer()),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 56,
          padding: '0 90px',
          backgroundColor: '#F6F1E7',
          color: '#1F2430',
          fontFamily: 'Inter',
        }}
      >
        <svg width="200" height="200" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="48" fill="#9E4524" />
          <path
            d="M31.5 75 C 31.5 55, 67.5 59, 67.5 43 C 67.5 27, 35.5 29, 41.5 13"
            fill="none"
            stroke="#F6F1E7"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="41.5" cy="13" r="5.5" fill="#E8B04A" />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: 'Fraunces', fontSize: 136, fontWeight: 600, letterSpacing: -3, lineHeight: 1 }}>
            ProdPath
          </div>
          <div style={{ marginTop: 28, fontSize: 40, color: '#666A75' }}>Learn product management in 5 weeks</div>
        </div>
      </div>
    ),
    {
      ...shareImageSize,
      fonts: [
        { name: 'Fraunces', data: fraunces, weight: 600, style: 'normal' },
        { name: 'Inter', data: inter, weight: 400, style: 'normal' },
      ],
    }
  );
}
