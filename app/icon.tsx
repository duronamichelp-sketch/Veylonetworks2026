import { ImageResponse } from 'next/server';

export const runtime = 'edge';
export const size = { width: 192, height: 192 };
export const contentType = 'image/png';

const logo = 'https://veylonetworks2026.vercel.app/Veylo_Networks_White_Transparent.png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: '#07111e',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: 150,
            height: 153,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <img
            src={logo}
            width={444}
            height={153}
            alt="Veylo Networks V"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              maxWidth: 'none',
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
