import { ImageResponse } from 'next/server';
import { VEYLO_HOME_ICON } from './veylo-home-image';

export const runtime = 'edge';
export const size = { width: 192, height: 192 };
export const contentType = 'image/png';

// Render the user's complete official logo, not a cropped letter.
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        <img
          src={VEYLO_HOME_ICON}
          alt="Veylo Networks"
          width={192}
          height={192}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    ),
    { ...size }
  );
}
