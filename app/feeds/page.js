'use client'

import Link from 'next/link'
import { Rss, Check, Copy, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import { toast } from 'sonner'

export default function FeedsPage() {
  const siteUrl = 'https://www.multigyan.in'
  const [copiedUrl, setCopiedUrl] = useState(null)

  const copyToClipboard = async (url) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrl(url)
      toast.success('Feed URL copied to clipboard!')
      setTimeout(() => setCopiedUrl(null), 2000)
    } catch (err) {
      toast.error('Failed to copy URL')
    }
  }

  const feeds = [
    {
      title: 'RSS Feed (Static)',
      description: 'Standard RSS 2.0 feed with all published articles. Recommended for most RSS readers.',
      url: `${siteUrl}/rss.xml`,
      feedlyUrl: `https://feedly.com/i/subscription/feed%2F${encodeURIComponent(`${siteUrl}/rss.xml`)}`,
      type: 'RSS 2.0',
      icon: '📰',
    },
    {
      title: 'RSS Feed (API)',
      description: 'Dynamic RSS 2.0 feed generated via API. Always up-to-date with latest content.',
      url: `${siteUrl}/api/feed/rss`,
      feedlyUrl: `https://feedly.com/i/subscription/feed%2F${encodeURIComponent(`${siteUrl}/api/feed/rss`)}`,
      type: 'RSS 2.0',
      icon: '🔄',
    },
    {
      title: 'Atom Feed',
      description: 'Atom 1.0 feed format with full article content and metadata.',
      url: `${siteUrl}/api/feed/atom`,
      feedlyUrl: `https://feedly.com/i/subscription/feed%2F${encodeURIComponent(`${siteUrl}/api/feed/atom`)}`,
      type: 'Atom 1.0',
      icon: '⚛️',
    },
  ]

  const popularReaders = [
    { name: 'Feedly', url: 'https://feedly.com', logo: '🌿' },
    { name: 'Inoreader', url: 'https://www.inoreader.com', logo: '📖' },
    { name: 'NewsBlur', url: 'https://www.newsblur.com', logo: '📡' },
    { name: 'The Old Reader', url: 'https://theoldreader.com', logo: '📚' },
  ]

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
          <Rss className="w-8 h-8 text-orange-600" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Subscribe to Our Feeds</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Stay updated with the latest articles from Multigyan. Choose your preferred feed format and reader.
        </p>
      </div>

      {/* What is RSS Section */}
      <Card className="mb-8 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-2xl">What is RSS?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">
            RSS (Really Simple Syndication) allows you to stay updated with your favorite websites without visiting them individually.
            Subscribe to our feed using any RSS reader, and you&apos;ll get notified whenever we publish new content.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
              <div>
                <h3 className="font-semibold mb-1">Choose a Feed</h3>
                <p className="text-sm text-gray-600">Pick one of our feed URLs below</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
              <div>
                <h3 className="font-semibold mb-1">Add to Reader</h3>
                <p className="text-sm text-gray-600">Paste the URL in your RSS reader</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">3</div>
              <div>
                <h3 className="font-semibold mb-1">Get Updates</h3>
                <p className="text-sm text-gray-600">Receive new articles automatically</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Feeds */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Available Feeds</h2>
        <div className="grid md:grid-cols-1 gap-6">
          {feeds.map((feed, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{feed.icon}</span>
                    <div>
                      <CardTitle className="text-xl">{feed.title}</CardTitle>
                      <CardDescription className="mt-1">{feed.description}</CardDescription>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    {feed.type}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Feed URL */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Feed URL</label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-100 p-3 rounded-lg font-mono text-sm break-all border border-gray-300">
                        {feed.url}
                      </div>
                      <button
                        onClick={() => copyToClipboard(feed.url)}
                        className={`flex-shrink-0 p-3 rounded-lg transition-colors ${copiedUrl === feed.url
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-800 text-white hover:bg-gray-700'
                          }`}
                        title={copiedUrl === feed.url ? 'Copied!' : 'Copy URL'}
                      >
                        {copiedUrl === feed.url ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={feed.feedlyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <span className="mr-2">🌿</span>
                      Subscribe with Feedly
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </a>
                    <a
                      href={feed.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
                    >
                      View Feed
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Popular RSS Readers */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Popular RSS Readers</h2>
        <p className="text-gray-600 mb-6">
          Don&apos;t have an RSS reader yet? Here are some popular options to get started:
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularReaders.map((reader, index) => (
            <a
              key={index}
              href={reader.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-6 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:shadow-md transition-all text-center group"
            >
              <span className="text-4xl mb-3 block">{reader.logo}</span>
              <h3 className="font-semibold text-lg group-hover:text-orange-600 transition-colors">
                {reader.name}
              </h3>
            </a>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Why Subscribe via RSS?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Privacy Friendly</h3>
                <p className="text-sm text-gray-600">No tracking, no data collection, just content delivery</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Ad-Free Reading</h3>
                <p className="text-sm text-gray-600">Read content without distractions in your preferred reader</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Never Miss a Post</h3>
                <p className="text-sm text-gray-600">Get notified immediately when new content is published</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Offline Access</h3>
                <p className="text-sm text-gray-600">Many RSS readers allow you to read articles offline</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-xl font-semibold mb-3">Need Help?</h3>
        <p className="text-gray-600 mb-4">
          Having trouble subscribing to our feeds? We&apos;re here to help!
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
        >
          Contact Support
          <ExternalLink className="ml-2 w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
