import { ImageResponse } from 'next/server';
import { VEYLO_HOME_ICON } from './veylo-home-image';

export const runtime = 'edge';
export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function LargeIcon() {
  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        <img src={VEYLO_HOME_ICON} alt="Veylo Networks" width={512} height={512}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    ),
    { ...size }
  );
}
