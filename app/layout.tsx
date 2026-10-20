import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ride Addis - Built for the high city',
  description: 'Premium bicycles and lifetime service, designed in Addis Ababa for riders across Ethiopia.',
  icons: { icon: '/icon.svg' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f4f2ed',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
