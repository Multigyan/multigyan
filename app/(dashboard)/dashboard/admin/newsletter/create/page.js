'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Save, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function CreateCampaign() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    previewText: '',
    content: '',
    htmlContent: '',
    targetAudience: 'all',
    template: 'basic',
    settings: {
      trackOpens: true,
      trackClicks: true,
      allowUnsubscribe: true
    }
  })
  const [testEmail, setTestEmail] = useState('')

  // Check if user is admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session && session.user.role !== 'admin') {
      router.push('/dashboard')
      toast.error('Admin access required')
    }
  }, [session, status, router])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.startsWith('settings.')) {
      const settingName = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [settingName]: type === 'checkbox' ? checked : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const generateHtmlContent = () => {
    // Generate HTML from plain content
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Multigyan Newsletter</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            ${formData.content.split('\n').map(para => `<p style="line-height: 1.6; color: #333; margin-bottom: 15px;">${para}</p>`).join('')}
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 40px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      font-size: 16px; 
                      font-weight: bold; 
                      display: inline-block;">
              Visit Multigyan
            </a>
          </div>
        </div>
      </div>
    `
    return html
  }

  const handleSaveDraft = async () => {
    if (!formData.title || !formData.subject || !formData.content) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)

      const htmlContent = formData.htmlContent || generateHtmlContent()

      const res = await fetch('/api/admin/newsletter/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          htmlContent
        })
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Campaign saved as draft')
        router.push('/dashboard/admin/newsletter')
      } else {
        toast.error(data.error || 'Failed to save campaign')
      }
    } catch (error) {
      console.error('Error saving campaign:', error)
      toast.error('Failed to save campaign')
    } finally {
      setLoading(false)
    }
  }

  const handleSendTest = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address')
      return
    }

    if (!formData.title || !formData.subject || !formData.content) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setSending(true)

      // First save as draft
      const htmlContent = formData.htmlContent || generateHtmlContent()

      const saveRes = await fetch('/api/admin/newsletter/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          htmlContent
        })
      })

      const saveData = await saveRes.json()

      if (!saveData.success) {
        toast.error('Failed to save campaign')
        return
      }

      // Send test email
      const sendRes = await fetch(`/api/admin/newsletter/campaigns/${saveData.campaign._id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ testEmail })
      })

      const sendData = await sendRes.json()

      if (sendData.success) {
        toast.success(`Test email sent to ${testEmail}`)
      } else {
        toast.error(sendData.error || 'Failed to send test email')
      }
    } catch (error) {
      console.error('Error sending test email:', error)
      toast.error('Failed to send test email')
    } finally {
      setSending(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/admin/newsletter">
          <button className="flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Newsletter Dashboard
          </button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Create Newsletter Campaign</h1>
        <p className="text-muted-foreground">
          Create and send a new newsletter to your subscribers
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Campaign Details */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Campaign Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Campaign Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Internal name for this campaign"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Email Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject line for the email"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Preview Text (Optional)
              </label>
              <input
                type="text"
                name="previewText"
                value={formData.previewText}
                onChange={handleChange}
                placeholder="Text shown in email preview"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={150}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.previewText.length}/150 characters
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Email Content</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Write your newsletter content here..."
                rows={12}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                This will be formatted as HTML automatically
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Custom HTML (Advanced)
              </label>
              <textarea
                name="htmlContent"
                value={formData.htmlContent}
                onChange={handleChange}
                placeholder="Optional: Add custom HTML email template"
                rows={6}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty to use auto-generated HTML
              </p>
            </div>
          </div>
        </div>

        {/* Targeting */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Audience</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Send To
            </label>
            <select
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Active Subscribers</option>
              <option value="category">Specific Categories</option>
              <option value="custom">Custom Email List</option>
            </select>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Settings</h2>
          
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="settings.trackOpens"
                checked={formData.settings.trackOpens}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm">Track email opens</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="settings.trackClicks"
                checked={formData.settings.trackClicks}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm">Track link clicks</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="settings.allowUnsubscribe"
                checked={formData.settings.allowUnsubscribe}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm">Include unsubscribe link</span>
            </label>
          </div>
        </div>

        {/* Test Email */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Send Test Email</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Send a test email to yourself before sending to all subscribers
          </p>
          
          <div className="flex space-x-4">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleSendTest}
              disabled={sending}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>{sending ? 'Sending...' : 'Send Test'}</span>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Link href="/dashboard/admin/newsletter">
            <button className="px-6 py-2 border rounded-lg hover:bg-accent">
              Cancel
            </button>
          </Link>
          
          <div className="flex space-x-4">
            <button
              onClick={handleSaveDraft}
              disabled={loading}
              className="bg-secondary text-secondary-foreground px-6 py-2 rounded-lg hover:bg-secondary/90 disabled:opacity-50 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Saving...' : 'Save Draft'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
