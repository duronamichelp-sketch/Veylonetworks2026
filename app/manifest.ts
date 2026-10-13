import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Veylo Networks',
    short_name: 'Veylo',
    description: 'Connect. Build. Grow. Your professional business network.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#07111e',
    theme_color: '#07111e',
    icons: [
      { src: '/icon', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/large-icon', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
