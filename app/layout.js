import './globals.css'
import 'nprogress/nprogress.css'
import { Inter } from 'next/font/google'
import { Toaster } from "@/components/ui/sonner"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import AuthProvider from "@/components/AuthProvider"
import LoadingBar from "@/components/LoadingBar"
import StructuredData from "@/components/seo/StructuredData"
import FloatingSocialSidebar from "@/components/layout/FloatingSocialSidebar"
import { generateStructuredData } from "@/lib/seo"

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: {
    default: 'Multigyan - Multi-Author Blogging Platform',
    template: '%s | Multigyan'
  },
  description: 'A secure, high-performance, and SEO-optimized multi-author blogging platform built with Next.js, MongoDB, and Cloudinary.',
  keywords: ['blog', 'nextjs', 'mongodb', 'multi-author', 'cms', 'multigyan'],
  authors: [{ name: 'Multigyan Team' }],
  creator: 'Multigyan',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://multigyan.in',
    title: 'Multigyan - Multi-Author Blogging Platform',
    description: 'A secure, high-performance, and SEO-optimized multi-author blogging platform.',
    siteName: 'Multigyan',
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
}

export default function RootLayout({ children }) {
  // Generate website structured data
  const websiteStructuredData = generateStructuredData({
    type: 'website',
    title: 'Multigyan - Multi-Author Blogging Platform',
    description: 'A secure, high-performance, and SEO-optimized multi-author blogging platform built with Next.js, MongoDB, and Cloudinary.',
    siteName: 'Multigyan'
  })

  const organizationStructuredData = generateStructuredData({
    type: 'organization',
    title: 'Multigyan',
    description: 'Multi-author blogging platform for knowledge sharing and content creation.',
    siteName: 'Multigyan'
  })

  return (
    <html lang="en" className={inter.className}>
      <head>
        <StructuredData data={websiteStructuredData} />
        <StructuredData data={organizationStructuredData} />
        <link rel="alternate" type="application/rss+xml" title="Multigyan RSS Feed" href="/api/feed/rss" />
        <link rel="alternate" type="application/atom+xml" title="Multigyan Atom Feed" href="/api/feed/atom" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      </head>
      <body 
        className="min-h-screen bg-background font-sans antialiased"
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          <LoadingBar />
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <FloatingSocialSidebar />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
