'use client'

import NewsletterSubscribe from './NewsletterSubscribe'

export default function NewsletterSidebar() {
  return (
    <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-lg p-6 border border-primary/20 sticky top-24">
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-3">
          <span className="text-2xl">📧</span>
        </div>
        <h3 className="text-lg font-bold mb-2">Never Miss an Update!</h3>
        <p className="text-sm text-muted-foreground">
          Subscribe to get our latest content delivered to your inbox
        </p>
      </div>

      <NewsletterSubscribe 
        source="sidebar"
        showTitle={false}
        compact={true}
        className="space-y-3"
      />

      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-2xl mb-1">📚</div>
            <p className="text-xs text-muted-foreground">Tech Articles</p>
          </div>
          <div>
            <div className="text-2xl mb-1">🍳</div>
            <p className="text-xs text-muted-foreground">Recipes</p>
          </div>
          <div>
            <div className="text-2xl mb-1">🔨</div>
            <p className="text-xs text-muted-foreground">DIY Guides</p>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          Join <span className="font-semibold text-foreground">1000+</span> subscribers
        </p>
      </div>
    </div>
  )
}
