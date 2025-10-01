import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Scale, Users, AlertTriangle, Copyright, UserX } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service | Multigyan',
  description: 'Read the Terms of Service for using the Multigyan blogging platform.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function TermsOfServicePage() {
  const lastUpdated = "January 1, 2025"

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Scale className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Terms of <span className="title-gradient">Service</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Introduction */}
        <Card className="blog-card mb-8">
          <CardContent className="p-6">
            <p className="text-muted-foreground leading-relaxed">
              Welcome to Multigyan. These Terms of Service govern your use of our website and services. 
              By accessing or using Multigyan, you agree to be bound by these terms. If you disagree with 
              any part of these terms, you may not access our service.
            </p>
          </CardContent>
        </Card>

        {/* Acceptance of Terms */}
        <Card className="blog-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Acceptance of Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              By creating an account, publishing content, or using any part of our services, you acknowledge 
              that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
            </p>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. Continued use of the service after changes 
              constitutes acceptance of the modified terms.
            </p>
          </CardContent>
        </Card>

        {/* User Accounts */}
        <Card className="blog-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              User Accounts and Registration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Account Creation</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>You must be at least 13 years old to create an account</li>
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining the security of your account</li>
                <li>You must not share your account credentials with others</li>
                <li>One person or legal entity may not maintain more than one account</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Account Responsibilities</h3>
              <p className="text-muted-foreground mb-2">
                You are solely responsible for all activity that occurs under your account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Keep your password secure and confidential</li>
                <li>Not impersonate any person or entity</li>
                <li>Not use the account to violate any laws or regulations</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Content Policy */}
        <Card className="blog-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Copyright className="h-6 w-6 text-primary" />
              Content and Conduct
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Your Content</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>You retain all rights to content you create and publish on Multigyan</li>
                <li>By publishing content, you grant us a license to display, distribute, and promote your content</li>
                <li>You are solely responsible for the content you publish</li>
                <li>You must have rights to any content you publish</li>
                <li>You must not publish copyrighted material without permission</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Prohibited Content</h3>
              <p className="text-muted-foreground mb-2">
                You agree not to publish content that:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Is illegal, harmful, threatening, abusive, or hateful</li>
                <li>Infringes on intellectual property rights</li>
                <li>Contains malware, viruses, or malicious code</li>
                <li>Violates privacy or data protection laws</li>
                <li>Contains spam or unsolicited advertising</li>
                <li>Promotes violence, discrimination, or illegal activities</li>
                <li>Contains false or misleading information</li>
                <li>Is pornographic, obscene, or sexually explicit</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Content Moderation</h3>
              <p className="text-muted-foreground">
                We reserve the right to review, remove, or modify any content that violates these terms. 
                Published content may be subject to approval before becoming public. We may suspend or 
                terminate accounts that repeatedly violate our content policy.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* User Conduct */}
        <Card className="blog-card mb-8">
          <CardHeader>
            <CardTitle>Acceptable Use</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              When using Multigyan, you agree not to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt our services</li>
              <li>Use automated tools to scrape or collect data</li>
              <li>Create fake accounts or manipulate engagement metrics</li>
              <li>Sell or transfer your account to others</li>
              <li>Use the service for commercial purposes without permission</li>
            </ul>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="blog-card mb-8">
          <CardHeader>
            <CardTitle>Intellectual Property Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The Multigyan platform, including its design, features, and functionality, is owned by us and 
              protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-muted-foreground mb-4">
              You may not copy, modify, distribute, sell, or lease any part of our services without explicit 
              written permission. Our trademarks and trade dress may not be used without our prior written consent.
            </p>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="blog-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-primary" />
              Disclaimer of Warranties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Multigyan is provided &#34;as is&#34; and &#34;as available&#34; without warranties of any kind, either express 
              or implied. We do not warrant that:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>The service will be uninterrupted, timely, or error-free</li>
              <li>The results obtained from using the service will be accurate or reliable</li>
              <li>Any errors in the service will be corrected</li>
              <li>The service meets your specific requirements</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              You use the service at your own risk. We are not responsible for any damages or losses resulting 
              from your use of the service.
            </p>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card className="blog-card mb-8">
          <CardHeader>
            <CardTitle>Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              To the maximum extent permitted by law, Multigyan and its affiliates, officers, employees, 
              agents, and licensors shall not be liable for any indirect, incidental, special, consequential, 
              or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, 
              or any loss of data, use, goodwill, or other intangible losses resulting from your use of the service.
            </p>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="blog-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserX className="h-6 w-6 text-primary" />
              Termination
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              We reserve the right to suspend or terminate your account and access to the service at any time, 
              with or without notice, for any reason, including but not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Violation of these Terms of Service</li>
              <li>Fraudulent, abusive, or illegal activity</li>
              <li>Extended periods of inactivity</li>
              <li>Technical or security reasons</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Upon termination, your right to use the service will immediately cease. You may delete your 
              account at any time through your account settings.
            </p>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card className="blog-card mb-8">
          <CardHeader>
            <CardTitle>Governing Law and Disputes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              These Terms shall be governed by and construed in accordance with the laws of India, without 
              regard to its conflict of law provisions.
            </p>
            <p className="text-muted-foreground">
              Any dispute arising from or relating to these Terms or your use of the service shall be resolved 
              through good faith negotiation. If no resolution is reached, disputes shall be subject to the 
              exclusive jurisdiction of the courts in Telangana, India.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card className="blog-card mb-8">
          <CardHeader>
            <CardTitle>Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, 
              we will provide at least 30 days notice before any new terms take effect. What constitutes a 
              material change will be determined at our sole discretion. By continuing to access or use our 
              service after revisions become effective, you agree to be bound by the revised terms.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="blog-card bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <strong>Email:</strong>{' '}
                <a href="mailto:legal@multigyan.com" className="text-primary hover:underline">
                  legal@multigyan.com
                </a>
              </li>
              <li>
                <strong>Website:</strong>{' '}
                <a href="/contact" className="text-primary hover:underline">
                  Contact Form
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
