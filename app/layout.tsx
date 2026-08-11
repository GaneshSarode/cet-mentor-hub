import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { ServiceWorkerRegistration } from '@/components/sw-register'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});
const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-geist-mono"
});

export const metadata: Metadata = {
  title: 'CET Mentor Hub | Free MHTCET Guidance by VJTI Students',
  description: 'Get free 1:1 mentorship from a real VJTI student. College predictor, MHT-CET PYQ online tests (2019–2025), and honest guidance for MHTCET aspirants.',
  keywords: ['MHTCET', 'MHT-CET', 'MHTCET 2026', 'mentorship', 'college predictor', 'previous year papers', 'VJTI', 'engineering', 'CAP round', 'MHTCET mock test'],
  authors: [{ name: 'CET Mentor Hub' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'CET Mentor Hub | Free MHTCET Guidance by VJTI Students',
    description: 'Get free 1:1 mentorship from a real VJTI student. Practice MHT-CET PYQs online with auto-grading and detailed solutions.',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'CET Mentor Hub Logo',
      },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0e1a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakarta.variable} ${geistMono.variable} font-sans antialiased`}>
        <ClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </ClerkProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}

