import { notFound } from 'next/navigation'
import AuthorClient from './AuthorClient'

// Fetch author data for metadata
async function getAuthor(username) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/author/${username}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) return null
    
    const data = await response.json()
    return data.success ? data.author : null
  } catch (error) {
    console.error('Error fetching author for metadata:', error)
    return null
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const resolvedParams = await params
  const { username } = resolvedParams
  
  const author = await getAuthor(username)
  
  if (!author) {
    return {
      title: 'Author Not Found - Multigyan',
    }
  }
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const authorUrl = `${siteUrl}/author/${author.username}`
  const imageUrl = author.profilePictureUrl || `${siteUrl}/images/default-author.jpg`
  
  return {
    title: `${author.name} (@${author.username}) - Articles on Multigyan`,
    description: author.bio || `Explore articles by ${author.name} on Multigyan. ${author.stats?.totalPosts || 0} published articles with ${author.stats?.totalViews?.toLocaleString() || 0} total views.`,
    keywords: [
      author.name,
      `${author.name} articles`,
      'Multigyan author',
      author.role === 'admin' ? 'Multigyan admin' : 'Multigyan writer',
      ...(author.bio ? author.bio.split(' ').slice(0, 5) : [])
    ],
    authors: [{ name: author.name }],
    creator: author.name,
    publisher: 'Multigyan',
    
    openGraph: {
      type: 'profile',
      title: `${author.name} (@${author.username})`,
      description: author.bio || `Read articles by ${author.name} on Multigyan`,
      url: authorUrl,
      siteName: 'Multigyan',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${author.name}'s profile picture`,
        },
      ],
      locale: 'en_US',
      profile: {
        firstName: author.name.split(' ')[0],
        lastName: author.name.split(' ').slice(1).join(' '),
        username: author.username,
        gender: 'neutral',
      },
    },
    
    twitter: {
      card: 'summary_large_image',
      title: `${author.name} (@${author.username})`,
      description: author.bio || `Read articles by ${author.name} on Multigyan`,
      images: [imageUrl],
      creator: author.twitterHandle || '@multigyan',
      site: '@multigyan',
    },
    
    alternates: {
      canonical: authorUrl,
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
}

// Main page component (server component)
export default function AuthorPage({ params }) {
  return <AuthorClient params={params} />
}

export const dynamic = 'force-dynamic'
