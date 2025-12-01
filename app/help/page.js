"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  HelpCircle,
  Search,
  BookOpen,
  User,
  Lock,
  FileText,
  MessageCircle,
  Mail,
  ChevronDown,
  ChevronUp,
  PenTool,
  Settings,
  AlertCircle
} from 'lucide-react'

// ✅ SEO: Help page metadata
export const metadata = {
  title: 'Help & Support',
  description: 'Find answers to common questions about Multigyan. Browse FAQs on account management, writing guides, security, comments, and technical support.',
  keywords: ['help', 'support', 'faq', 'guide', 'documentation', 'troubleshooting'],
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFAQ, setExpandedFAQ] = useState(null)

  // Set page title
  useEffect(() => {
    document.title = "Help & Support | Multigyan"
  }, [])

  const faqs = [
    {
      category: 'Getting Started',
      icon: <BookOpen className="h-5 w-5" />,
      questions: [
        {
          q: 'How do I create an account?',
          a: 'Click on "Sign In" in the top right corner, then select "Sign up" or "Get Started". Fill in your name, email, and password. You&apos;ll receive a confirmation email to verify your account.'
        },
        {
          q: 'What are the different user roles?',
          a: 'Multigyan has two main roles: Authors can create and manage their own posts (blog articles, DIY tutorials, or recipes), while Admins have additional permissions including approving posts, managing users, moderating comments, and accessing site-wide analytics. The platform supports up to 4 admin accounts.'
        },
        {
          q: 'Is Multigyan free to use?',
          a: 'Yes, Multigyan is currently free to use for all users. You can create an account, write articles, and interact with content at no cost.'
        }
      ]
    },
    {
      category: 'Writing & Publishing',
      icon: <PenTool className="h-5 w-5" />,
      questions: [
        {
          q: 'How do I create a new post?',
          a: 'Navigate to Dashboard → New Post. Choose between two modes: (1) Creation Mode - Quick Post (6 essential fields) or Full Post (30+ fields) with all features and advanced options, or (2) Wizard Mode - Traditional 3-step guided flow (Basic Info → Content → Settings). Use the TipTap editor, add images via Cloudinary, and submit for admin review. Three action buttons are available: Clear Auto Saved Draft, Save Draft (manual save), and Preview (see how it looks before publishing).'
        },
        {
          q: 'What is the post approval process?',
          a: 'After creating your post, save it as a draft or submit it for review. Admin users will review your content for quality and compliance. Once approved, your post (blog article, DIY tutorial, or recipe) will be published and visible to all visitors. You\'ll receive notifications about the approval status.'
        },
        {
          q: 'Can I edit my published posts?',
          a: 'Yes, you can edit your posts at any time from your dashboard. However, edited posts may need to go through the approval process again if significant changes are made.'
        },
        {
          q: 'What image formats are supported?',
          a: 'We support JPG, PNG, WebP, and GIF formats. Images are automatically optimized and hosted on Cloudinary for fast, reliable delivery. Maximum file size is 5MB per image. All images are automatically compressed and converted to WebP format for optimal performance.'
        },
        {
          q: 'How do I add categories and tags?',
          a: 'When creating or editing a post, select a category from the dropdown (Blog, DIY, or Recipe). For DIY posts, you can also set difficulty level (Easy/Medium/Hard). For Recipe posts, add cuisine type, dietary preferences, prep time, and cook time. Tags help with discovery and SEO.'
        }
      ]
    },
    {
      category: 'Account Management',
      icon: <User className="h-5 w-5" />,
      questions: [
        {
          q: 'How do I update my profile?',
          a: 'Go to your dashboard and click on your profile or "Settings". Here you can update your name, bio, profile picture, social media links, and other personal information.'
        },
        {
          q: 'How do I change my password?',
          a: 'Navigate to Settings > Account > Change Password. Enter your current password, then your new password twice to confirm. Make sure to use a strong, unique password.'
        },
        {
          q: 'Can I delete my account?',
          a: 'Yes, you can request account deletion from your account settings. Please note that this action is permanent and will remove all your content and data from our platform.'
        }
      ]
    },
    {
      category: 'Comments & Interaction',
      icon: <MessageCircle className="h-5 w-5" />,
      questions: [
        {
          q: 'How do I comment on posts?',
          a: 'Scroll to the bottom of any published post and use the comment form. You can comment as a registered user or as a guest by providing your name and email.'
        },
        {
          q: 'Can I reply to comments?',
          a: 'Yes, click the "Reply" button under any comment to respond directly. Replies are nested under the original comment for easy following of conversations.'
        },
        {
          q: 'How does comment moderation work?',
          a: 'All comments require approval before being published. Admins review comments to ensure they comply with our community guidelines. Approved comments appear publicly on the post.'
        }
      ]
    },
    {
      category: 'Security & Privacy',
      icon: <Lock className="h-5 w-5" />,
      questions: [
        {
          q: 'How is my data protected?',
          a: 'We use industry-standard security measures including SSL encryption, secure password hashing with bcrypt, and NextAuth.js for authentication. Your data is stored securely on MongoDB Atlas with regular backups.'
        },
        {
          q: 'What information do you collect?',
          a: 'We collect information you provide (name, email, content) and automatically collect usage data (IP address, browser type, pages visited). See our Privacy Policy for complete details.'
        },
        {
          q: 'Can I export my data?',
          a: 'Yes, you can request a copy of your data by contacting us at privacy@multigyan.com. We&apos;ll provide your data in a standard format within 30 days.'
        }
      ]
    },
    {
      category: 'Technical Issues',
      icon: <Settings className="h-5 w-5" />,
      questions: [
        {
          q: 'Why can\'t I upload images?',
          a: 'Check that your image is under 5MB and in a supported format (JPG, PNG, WebP, GIF). Ensure you have a stable internet connection as images are uploaded to Cloudinary. Clear your browser cache and try again. If the issue persists, contact support at contact@multigyan.com.'
        },
        {
          q: 'The editor is not loading properly',
          a: 'The TipTap editor requires JavaScript to be enabled. Try refreshing your browser or clearing your cache. Disable ad blockers temporarily as they may interfere with the editor. Ensure you\'re using a modern browser (Chrome, Firefox, Safari, or Edge). Contact support if problems continue.'
        },
        {
          q: 'I&apos;m not receiving email notifications',
          a: 'Check your spam/junk folder. Add noreply@multigyan.com to your contacts. Verify your email settings in your account preferences.'
        }
      ]
    }
  ]

  const filteredFAQs = searchQuery
    ? faqs.map(category => ({
      ...category,
      questions: category.questions.filter(faq =>
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(category => category.questions.length > 0)
    : faqs

  const toggleFAQ = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`
    setExpandedFAQ(expandedFAQ === key ? null : key)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/50 via-white to-emerald-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/5 dark:to-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-tr from-emerald-500/10 to-green-500/10 dark:from-emerald-500/5 dark:to-green-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 py-12">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-6 flex items-center justify-center">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Help & <span className="title-gradient">Support</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Find answers to common questions and get the help you need
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for help..."
                className="pl-12 py-6 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-4 gap-4 mb-16 max-w-6xl mx-auto">
            <Card className="blog-card cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Getting Started</CardTitle>
                <CardDescription className="text-sm">
                  New to Multigyan? Start here
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="blog-card cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <PenTool className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Writing Guide</CardTitle>
                <CardDescription className="text-sm">
                  Learn how to create great content
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="blog-card cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Security</CardTitle>
                <CardDescription className="text-sm">
                  Keep your account safe
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="blog-card cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Contact Us</CardTitle>
                <CardDescription className="text-sm">
                  Still need help? Get in touch
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* FAQs */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Frequently Asked <span className="title-gradient">Questions</span>
            </h2>

            {filteredFAQs.length === 0 ? (
              <Card className="blog-card">
                <CardContent className="p-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">
                    No results found for &quot;{searchQuery}&quot;
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try a different search term or contact us for help
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredFAQs.map((category, categoryIndex) => (
                  <Card key={categoryIndex} className="blog-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {category.icon}
                        {category.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {category.questions.map((faq, questionIndex) => {
                        const key = `${categoryIndex}-${questionIndex}`
                        const isExpanded = expandedFAQ === key

                        return (
                          <div
                            key={questionIndex}
                            className="border rounded-lg overflow-hidden"
                          >
                            <button
                              onClick={() => toggleFAQ(categoryIndex, questionIndex)}
                              className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                            >
                              <span className="font-medium">{faq.q}</span>
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                              )}
                            </button>
                            {isExpanded && (
                              <div className="px-4 py-3 bg-muted/30 border-t">
                                <p className="text-muted-foreground">{faq.a}</p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Contact Support */}
          <Card className="blog-card bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 mt-16 max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Still Need Help?</CardTitle>
              <CardDescription className="text-base">
                Can&apos;t find what you&apos;re looking for? Our support team is here to help
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/contact">
                  <Mail className="mr-2 h-5 w-5" />
                  Contact Support
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="mailto:support@multigyan.com">
                  <Mail className="mr-2 h-5 w-5" />
                  Email Us
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
