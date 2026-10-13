import { ImageResponse } from 'next/server';
import { VEYLO_HOME_ICON } from './veylo-home-image';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// Apple uses this full Veylo artwork for Safari's Add to Home Screen action.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        <img
          src={VEYLO_HOME_ICON}
          alt="Veylo Networks"
          width={180}
          height={180}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    ),
    { ...size }
  );
}
