import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'e-Shalgalt',
    short_name: 'e-Shalgalt',
    description: 'Монгол улсын боловсролын үндэсний шалгалт, үнэлгээний платформ',
    start_url: '/',
    display: 'standalone',
    background_color: '#F0F2F5',
    theme_color: '#0A2D6E',
    lang: 'mn',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  }
}
