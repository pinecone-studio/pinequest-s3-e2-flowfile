import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import 'mathlive/static.css'
import 'mathlive/fonts.css'
import 'ketcher-react/dist/index.css'
import './globals.css'
import { DataInitializer } from '@/components/data-initializer'
import { PlatformSwitcher } from '@/components/platform-switcher'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'e-Shalgalt | Үндэсний шалгалтын систем',
  description: 'Монгол улсын боловсролын үндэсний шалгалт, үнэлгээний платформ',
  generator: 'v0.app',
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
        <DataInitializer />
        <div className="min-h-screen flex flex-col">
          <PlatformSwitcher />
          <div className="flex-1">
            {children}
          </div>
        </div>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
