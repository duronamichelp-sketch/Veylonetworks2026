import { ImageResponse } from 'next/server';

export const runtime = 'edge';
export const alt = 'Veylo Networks — Connect. Build. Grow.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const logo = 'https://veylonetworks2026.vercel.app/Veylo_Networks_White_Transparent.png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #07111e 0%, #030710 60%, #061d35 100%)',
          fontFamily: 'Arial, sans-serif',
          color: 'white',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: 0,
            left: 0,
            height: 10,
            width: '100%',
            background: 'linear-gradient(90deg, #0458ed, #00bff3)',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={logo}
            width={820}
            height={282}
            alt="Veylo Networks"
            style={{ objectFit: 'contain' }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 39,
            fontWeight: 700,
            letterSpacing: 1.5,
            marginTop: 12,
          }}
        >
          Connect. Build. Grow.
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 23,
            color: '#91b6d9',
            letterSpacing: 1,
            marginTop: 22,
          }}
        >
          The future of business networking.
        </div>
      </div>
    ),
    { ...size }
  );
}
