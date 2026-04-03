import type { Metadata, Viewport } from 'next'
import 'mathlive/fonts.css'
import './globals.css'
import { DataInitializer } from '@/components/data-initializer'
import { PwaProvider } from '@/components/pwa-provider'
import { PlatformSwitcher } from '@/components/platform-switcher'
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
      <body className="font-sans antialiased">
        <PwaProvider />
        <DataInitializer />
        <div className="min-h-screen flex flex-col">
          <PlatformSwitcher />
          <div className="flex-1">
            {children}
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  )
}
