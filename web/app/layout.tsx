import type { Metadata, Viewport } from 'next'
import { Montserrat } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { DataInitializer } from '@/components/DataInitializer'
import { Toaster } from '@/components/ui/toaster'
import { PlatformSwitcher } from '@/components/PlatformSwitcher'

const montserrat = Montserrat({ 
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600'],
  variable: '--font-montserrat',
})

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
      <body className={`${montserrat.variable} font-sans antialiased`}>
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
