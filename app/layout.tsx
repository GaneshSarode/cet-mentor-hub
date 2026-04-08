import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});
const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-geist-mono"
});

export const metadata: Metadata = {
  title: 'CET Mentor Hub | Get Mentored by Top College Students',
  description: 'Connect with verified mentors from VJTI, ICT, COEP, PICT for 1:1 sessions. College predictor, mock tests, and personalized guidance for MHTCET & JEE aspirants.',
  keywords: ['MHTCET', 'JEE', 'mentorship', 'college predictor', 'mock tests', 'VJTI', 'ICT', 'COEP', 'engineering'],
  authors: [{ name: 'CET Mentor Hub' }],
  openGraph: {
    title: 'CET Mentor Hub | Get Mentored by Top College Students',
    description: 'Connect with verified mentors from VJTI, ICT, COEP, PICT for 1:1 sessions.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
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
      <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

