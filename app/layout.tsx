import type { Metadata, Viewport } from 'next'
import { Geist, Space_Grotesk } from 'next/font/google'
import './globals.css'
import './glass.css'

/**
 * Self-hosted, zero-render-blocking typography.
 * `Space Grotesk` = modern geometric "box" display face (headlines, prices, numbers).
 * `Geist` = crisp neutral UI face for body copy, inputs and buttons.
 * Both are variable fonts, so a single file covers every weight.
 */
const displayFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const bodyFont = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Ride Addis - Built for the high city',
  description: 'Premium bicycles and lifetime service, designed in Addis Ababa for riders across Ethiopia.',
  icons: { icon: '/icon.svg' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  interactiveWidget: 'resizes-content',
  themeColor: '#f4f2ed',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="preload" href="/bike-mtb.webp" as="image" type="image/webp" />
        <link rel="preload" href="/bike-road.webp" as="image" type="image/webp" />
        <link rel="preload" href="/bike-city.webp" as="image" type="image/webp" />
        <link rel="preload" href="/bike-kids.webp" as="image" type="image/webp" />
      </head>
      <body>{children}</body>
    </html>
  )
}
