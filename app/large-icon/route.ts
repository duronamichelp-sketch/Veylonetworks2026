import { createElement } from 'react';
import { ImageResponse } from 'next/server';
import { VEYLO_HOME_ICON } from '../veylo-home-image';

export const runtime = 'edge';

// Android home-screen applications can request a larger branded icon.
export function GET() {
  return new ImageResponse(
    createElement(
      'div',
      { style: { display: 'flex', width: '100%', height: '100%' } },
      createElement('img', {
        src: VEYLO_HOME_ICON,
        alt: 'Veylo Networks',
        width: 512,
        height: 512,
        style: { width: '100%', height: '100%', objectFit: 'cover' },
      })
    ),
    { width: 512, height: 512 }
  );
}
