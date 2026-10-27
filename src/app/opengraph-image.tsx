import { renderShareImage } from '@/components/ShareImage';

// Edge runtime: the Node version of the image renderer cannot find its built-in font on Windows
export const runtime = 'edge';
export const alt = 'ProdPath: Learn product management in 6 weeks';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return renderShareImage();
}
