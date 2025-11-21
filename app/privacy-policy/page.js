import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Lock, Eye, Database, Mail, UserCheck } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy | Multigyan',
  description: 'Learn how Multigyan collects, uses, and protects your personal information.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function PrivacyPolicyPage() {
  const lastUpdated = "January 1, 2025"

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Privacy <span className="title-gradient">Policy</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Introduction */}
        <Card className="blog-card mb-8">
          <CardContent className="p-6">
            <p className="text-muted-foreground leading-relaxed">
              At Multigyan, we take your privacy seriously. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you visit our website and use our services.
              Please read this privacy policy carefully. If you do not agree with the terms of this privacy
              policy, please do not access the site.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card className="blog-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Personal Information</h3>
              <p className="text-muted-foreground mb-2">
                We may collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Register for an account</li>
                <li>Create or publish content</li>
                <li>Comment on posts</li>
                <li>Subscribe to our newsletter</li>
                <li>Contact us directly</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                This information may include: name, email address, username, profile picture, and any other
                information you choose to provide.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Automatically Collected Information</h3>
              <p className="text-muted-foreground mb-2">
                When you visit our website, we automatically collect certain information about your device, including:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Pages visited and time spent</li>
                <li>Referring website addresses</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card className="blog-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-primary" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Create and manage your account</li>
              <li>Provide, operate, and maintain our services</li>
              <li>Process and deliver your content</li>
              <li>Send you administrative information and updates</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Monitor and analyze usage and trends to improve user experience</li>
              <li>Detect, prevent, and address technical issues and security threats</li>
              <li>Send you newsletters and marketing communications (with your consent)</li>
              <li>Enforce our terms and conditions</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="blog-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-6 w-6 text-primary" />
              Data Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              We implement appropriate technical and organizational security measures to protect your personal
              information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Secure Socket Layer (SSL) encryption technology</li>
              <li>Regular security audits and updates</li>
              <li>Restricted access to personal information</li>
              <li>Secure password hashing with bcrypt</li>
              <li>NextAuth.js for secure authentication</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              However, no method of transmission over the Internet or electronic storage is 100% secure.
              While we strive to use commercially acceptable means to protect your personal information,
              we cannot guarantee its absolute security.
            </p>
          </CardContent>
        </Card>

        {/* Information Sharing */}
        <Card className="blog-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-6 w-6 text-primary" />
              Information Sharing and Disclosure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your
              information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>With your consent:</strong> When you explicitly agree to share your information</li>
              <li><strong>Service providers:</strong> With third-party vendors who assist us in operating our platform
                (e.g., Cloudinary for image hosting, MongoDB Atlas for database services)</li>
              <li><strong>Legal requirements:</strong> When required by law or to protect our rights and safety</li>
              <li><strong>Business transfers:</strong> In connection with any merger, sale, or acquisition</li>
            </ul>
          </CardContent>
        </Card>

        {/* Cookies and Tracking */}
        <Card className="blog-card mb-8">
          <CardHeader>
            <CardTitle>Cookies and Tracking Technologies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              We use cookies and similar tracking technologies to track activity on our website and hold certain information.
              Cookies are files with small amount of data that are sent to your browser from a website and stored on your device.
            </p>
            <p className="text-muted-foreground mb-4">
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              However, if you do not accept cookies, you may not be able to use some portions of our website.
            </p>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="blog-card mb-8">
          <CardHeader>
            <CardTitle>Your Privacy Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Access and review your personal information</li>
              <li>Update or correct your personal information</li>
              <li>Delete your account and personal information</li>
              <li>Opt-out of marketing communications</li>
              <li>Request a copy of your data</li>
              <li>Object to processing of your personal information</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              To exercise these rights, please contact us at{' '}
              <a href="mailto:privacy@multigyan.com" className="text-primary hover:underline">
                privacy@multigyan.com
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Third-Party Links */}
        <Card className="blog-card mb-8">
          <CardHeader>
            <CardTitle>Third-Party Links</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Our website may contain links to third-party websites. We have no control over and assume no
              responsibility for the content, privacy policies, or practices of any third-party sites or services.
              We encourage you to review the privacy policies of any third-party sites you visit.
            </p>
          </CardContent>
        </Card>

        {/* Children's Privacy */}
        <Card className="blog-card mb-8">
          <CardHeader>
            <CardTitle>Children&#39;s Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Our services are not intended for children under the age of 13. We do not knowingly collect personal
              information from children under 13. If you become aware that a child has provided us with personal
              information, please contact us. If we discover that we have collected personal information from a
              child under 13, we will delete that information immediately.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Privacy Policy */}
        <Card className="blog-card mb-8">
          <CardHeader>
            <CardTitle>Changes to This Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the
              new Privacy Policy on this page and updating the &#34;Last updated&#34; date. You are advised to review this
              Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they
              are posted on this page.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="blog-card bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <strong>Email:</strong>{' '}
                <a href="mailto:privacy@multigyan.com" className="text-primary hover:underline">
                  privacy@multigyan.com
                </a>
              </li>
              <li>
                <strong>Website:</strong>{' '}
                <Link href="/contact" className="text-primary hover:underline">
                  Contact Form
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
