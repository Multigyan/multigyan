'use client'

import { useState, useEffect } from 'react'
import { Mail, Loader2, CheckCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NewsletterSubscribe({ 
  source = 'footer',
  className = '',
  showTitle = true,
  compact = false 
}) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [showPreferencesModal, setShowPreferencesModal] = useState(false)
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [frequency, setFrequency] = useState('weekly')

  // Fetch categories when modal opens
  useEffect(() => {
    if (showPreferencesModal && categories.length === 0) {
      fetchCategories()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPreferencesModal])

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)
      const res = await fetch('/api/categories?limit=100')
      const data = await res.json()
      
      if (data.categories) {
        // Get only main categories (not sub-categories)
        const mainCategories = data.categories.filter(cat => !cat.parent)
        setCategories(mainCategories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !email.trim()) {
      toast.error('Please enter your email')
      return
    }

    // Validate email
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address')
      return
    }

    // Show preferences modal
    setShowPreferencesModal(true)
  }

  const handleSubscribe = async () => {
    try {
      setLoading(true)

      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          source,
          preferences: {
            frequency,
            categories: selectedCategories
          }
        })
      })

      const data = await res.json()

      if (data.success) {
        setSubscribed(true)
        setShowPreferencesModal(false)
        setEmail('')
        // Show success message
        toast.success('Successfully subscribed! Check your inbox for a welcome email.')
      } else {
        toast.error(data.error || 'Failed to subscribe')
      }
    } catch (error) {
      console.error('Subscription error:', error)
      toast.error('Failed to subscribe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
  }

  const selectAll = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([])
    } else {
      setSelectedCategories(categories.map(cat => cat._id))
    }
  }

  if (subscribed && !showPreferencesModal) {
    return (
      <div className={`flex items-center space-x-2 text-green-500 ${className}`}>
        <CheckCircle className="h-5 w-5" />
        <p className="text-sm">Thank you for subscribing!</p>
      </div>
    )
  }

  return (
    <>
      {/* Subscription Form */}
      <div className={className}>
        {showTitle && !compact && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Subscribe to Our Newsletter</h3>
            <p className="text-sm text-muted-foreground">
              Get the latest articles, recipes, and DIY tutorials delivered to your inbox
            </p>
          </div>
        )}

        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center space-x-2 whitespace-nowrap"
            >
              <Mail className="h-4 w-4" />
              <span>Subscribe</span>
            </button>
          </div>
          {!compact && (
            <p className="text-xs text-muted-foreground">
              Get the latest posts delivered right to your inbox. Unsubscribe anytime.
            </p>
          )}
        </form>
      </div>

      {/* Preferences Modal */}
      {showPreferencesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Choose Your Interests</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Select the topics you&#39;d like to receive updates about
                </p>
              </div>
              <button
                onClick={() => setShowPreferencesModal(false)}
                className="p-2 hover:bg-accent rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Frequency Selection */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  How often would you like to receive emails?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['daily', 'weekly', 'monthly'].map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setFrequency(freq)}
                      className={`p-3 border rounded-lg text-sm font-medium capitalize transition ${
                        frequency === freq
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'hover:bg-accent'
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium">
                    Select Content Types
                  </label>
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-sm text-primary hover:underline"
                  >
                    {selectedCategories.length === categories.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                {loadingCategories ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {categories.map((category) => (
                      <button
                        key={category._id}
                        type="button"
                        onClick={() => toggleCategory(category._id)}
                        className={`p-3 border rounded-lg text-sm transition text-left ${
                          selectedCategories.includes(category._id)
                            ? 'bg-primary/10 border-primary'
                            : 'hover:bg-accent'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              selectedCategories.includes(category._id)
                                ? 'bg-primary border-primary'
                                : 'border-gray-300'
                            }`}
                          >
                            {selectedCategories.includes(category._id) && (
                              <CheckCircle className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {selectedCategories.length === 0 && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                    💡 No categories selected? You&apos;ll receive updates about all topics!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-background border-t p-6 flex justify-between items-center">
              <button
                onClick={() => setShowPreferencesModal(false)}
                className="px-6 py-2 border rounded-lg hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="bg-primary text-primary-foreground px-8 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Subscribing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Complete Subscription</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
