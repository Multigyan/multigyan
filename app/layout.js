import './globals.css'
import 'nprogress/nprogress.css'
import { Inter } from 'next/font/google'
import { Toaster } from "@/components/ui/sonner"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import AuthProvider from "@/components/AuthProvider"
import LoadingBar from "@/components/LoadingBar"
import FloatingSocialSidebar from "@/components/layout/FloatingSocialSidebar"
import BackToTop from "@/components/ui/BackToTop"
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Multigyan - Multi-Author Blogging Platform',
    template: '%s | Multigyan'
  },
  description: 'A secure, high-performance, and SEO-optimized multi-author blogging platform built with Next.js, MongoDB, and Cloudinary.',
  keywords: ['blog', 'nextjs', 'mongodb', 'multi-author', 'cms', 'multigyan'],
  authors: [{ name: 'Multigyan Team' }],
  creator: 'Multigyan',
  verification: {
    google: 'pub-1982960683340318',
  },
  other: {
    'google-analytics': 'G-HEPC56C10C',
  },
  icons: {
    icon: [
      { url: '/Multigyan_Logo.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/Multigyan_Logo_bg.ico', sizes: '32x32', type: 'image/x-icon' }
    ],
    shortcut: '/Multigyan_Logo_bg.ico',
    apple: [
      { url: '/Multigyan_Logo_bg.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      {
        rel: 'icon',
        url: '/Multigyan_Logo_bg.ico',
      }
    ]
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://multigyan.in',
    title: 'Multigyan - Multi-Author Blogging Platform',
    description: 'A secure, high-performance, and SEO-optimized multi-author blogging platform.',
    siteName: 'Multigyan',
    images: [
      {
        url: '/Multigyan_Logo_bg.png',
        width: 512,
        height: 512,
        alt: 'Multigyan Logo',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Multigyan - Multi-Author Blogging Platform',
    description: 'A secure, high-performance, and SEO-optimized multi-author blogging platform.',
    creator: '@multigyan',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    types: {
      'application/rss+xml': [
        { url: '/rss.xml', title: 'Multigyan RSS Feed' },
        { url: '/api/feed/rss', title: 'Multigyan RSS Feed (API)' },
      ],
      'application/atom+xml': [
        { url: '/api/feed/atom', title: 'Multigyan Atom Feed' },
      ],
    },
  },
}

export default function RootLayout({ children }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://multigyan.in'
  
  // ✅ ENHANCED: Website Schema with proper structure
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Multigyan",
    "alternateName": "Multigyan Blog",
    "url": baseUrl,
    "description": "A secure, high-performance, and SEO-optimized multi-author blogging platform for sharing knowledge and insights.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Multigyan",
      "url": baseUrl
    }
  }

  // ✅ ENHANCED: Organization Schema with social profiles
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Multigyan",
    "alternateName": "Multigyan Blog Platform",
    "url": baseUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${baseUrl}/Multigyan_Logo_bg.png`,
      "width": 512,
      "height": 512
    },
    "description": "Multi-author blogging platform for knowledge sharing and content creation.",
    "foundingDate": "2024",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "email": "support@multigyan.in",
      "url": `${baseUrl}/contact`
    },
    "sameAs": [
      "https://twitter.com/multigyan",
      "https://linkedin.com/company/multigyan",
      "https://facebook.com/multigyan"
    ]
  }

  return (
    <html lang="en" className={inter.className}>
      <head>
        {/* ✅ CRITICAL: Schema markup MUST be in <head> for Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema)
          }}
        />
        
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1982960683340318"
          crossOrigin="anonymous"
        />
      </head>
      <body 
        className="min-h-screen bg-background font-sans antialiased"
        suppressHydrationWarning={true}
      >
        {/* Google Analytics 4 */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-HEPC56C10C"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-HEPC56C10C', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
        
        <AuthProvider>
          <LoadingBar />
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <FloatingSocialSidebar />
          <BackToTop />
          <Toaster />
        </AuthProvider>
        
        {/* Vercel Analytics */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
