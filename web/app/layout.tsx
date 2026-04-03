import type { Metadata, Viewport } from 'next'
import 'mathlive/fonts.css'
import 'ketcher-react/dist/index.css'
import './globals.css'
import { PlatformSwitcher } from '@/components/platform-switcher'
import { DataInitializer } from '@/components/data-initializer'
import { PwaProvider } from '@/components/pwa-provider'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'e-Shalgalt | Үндэсний шалгалтын систем',
  description: 'Монгол улсын боловсролын үндэсний шалгалт, үнэлгээний платформ',
  generator: 'v0.app',
  manifest: '/manifest.webmanifest',
}

export const viewport: Viewport = {
  themeColor: '#0A2D6E',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="mn">
      <body className="font-sans antialiased [--platform-switcher-height:36px]">
        <PwaProvider />
        <DataInitializer />
        <PlatformSwitcher />
        <div className="min-h-screen pt-9">{children}</div>
        <Toaster />
      </body>
    </html>
  )
}
