import NewsletterSubscribe from '@/components/newsletter/NewsletterSubscribe'
import { Mail, TrendingUp, Zap, Shield, Gift, Users } from 'lucide-react'

export const metadata = {
  title: 'Subscribe to Newsletter - Multigyan',
  description: 'Get the latest articles, recipes, and DIY tutorials delivered straight to your inbox. Join thousands of subscribers and never miss an update.',
  openGraph: {
    title: 'Subscribe to Multigyan Newsletter',
    description: 'Get expert content delivered to your inbox',
    type: 'website',
  }
}

export default function NewsletterPage() {
  return (
    <div className="min-h-screen py-16">
      {/* Hero Section */}
      <div className="container mx-auto px-4 mb-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple-500 mb-6">
            <Mail className="h-10 w-10 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Stay Updated with <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Multigyan</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-4">
            Join thousands of learners and get the best content delivered weekly
          </p>
          
          <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>1000+ Subscribers</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>Weekly Digest</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>No Spam</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Form */}
      <div className="container mx-auto px-4 mb-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border rounded-xl p-8 shadow-lg">
            <NewsletterSubscribe 
              source="newsletter_page"
              showTitle={false}
              className="space-y-4"
            />
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 mb-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What You'll Get</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card border rounded-lg p-6 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                <span className="text-3xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Latest Articles</h3>
              <p className="text-muted-foreground">
                Expert articles on technology, programming, web development, and software engineering
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card border rounded-lg p-6 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                <span className="text-3xl">🍳</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Delicious Recipes</h3>
              <p className="text-muted-foreground">
                New recipes, cooking tips, and culinary adventures from around the world
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card border rounded-lg p-6 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                <span className="text-3xl">🔨</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">DIY Tutorials</h3>
              <p className="text-muted-foreground">
                Step-by-step guides for exciting DIY projects and creative crafts
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-card border rounded-lg p-6 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Exclusive Content</h3>
              <p className="text-muted-foreground">
                Subscriber-only tips, resources, and early access to new content
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-card border rounded-lg p-6 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Weekly Digest</h3>
              <p className="text-muted-foreground">
                Curated selection of our best content delivered every week
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-card border rounded-lg p-6 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-4">
                <Gift className="h-6 w-6 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Special Offers</h3>
              <p className="text-muted-foreground">
                Get notified about exclusive deals, giveaways, and special events
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="container mx-auto px-4 mb-16">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-xl p-8 md:p-12 border border-primary/20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            What Our Subscribers Say
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-background rounded-lg p-6 border">
              <div className="flex items-center space-x-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-500">⭐</span>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                "Best newsletter I've subscribed to! Always delivers quality content right when I need it."
              </p>
              <p className="text-sm font-semibold">- Rahul K.</p>
            </div>

            <div className="bg-background rounded-lg p-6 border">
              <div className="flex items-center space-x-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-500">⭐</span>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                "Love the variety! From tech articles to recipes, there's something for everyone."
              </p>
              <p className="text-sm font-semibold">- Priya S.</p>
            </div>

            <div className="bg-background rounded-lg p-6 border">
              <div className="flex items-center space-x-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-500">⭐</span>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                "The DIY tutorials are amazing! I've completed 5 projects already thanks to these guides."
              </p>
              <p className="text-sm font-semibold">- Amit P.</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 mb-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-2">How often will I receive emails?</h3>
              <p className="text-muted-foreground">
                You can choose your preferred frequency - daily, weekly, or monthly. Most subscribers prefer our weekly digest which comes out every Monday.
              </p>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-2">Can I unsubscribe anytime?</h3>
              <p className="text-muted-foreground">
                Absolutely! Every email includes an unsubscribe link. We respect your inbox and you can leave anytime with just one click.
              </p>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-2">Will you share my email?</h3>
              <p className="text-muted-foreground">
                Never! We take privacy seriously. Your email is safe with us and will never be shared with third parties.
              </p>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-2">Can I choose specific topics?</h3>
              <p className="text-muted-foreground">
                Yes! When you subscribe, you can select which types of content you want to receive - tech articles, recipes, DIY tutorials, or all of them!
              </p>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-2">Is it really free?</h3>
              <p className="text-muted-foreground">
                100% free! No hidden costs, no premium tiers. We believe great content should be accessible to everyone.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-primary to-purple-500 rounded-xl p-8 md:p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Join Our Community?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Subscribe now and get access to exclusive content, weekly digests, and be part of a growing community of learners.
          </p>
          <a 
            href="#top" 
            className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Subscribe Now
          </a>
        </div>
      </div>
    </div>
  )
}
