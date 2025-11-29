'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Mail,
  Send,
  Users,
  TrendingUp,
  Calendar,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Search
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function NewsletterDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview') // 'overview', 'subscribers', 'campaigns'
  const [subscribers, setSubscribers] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [stats, setStats] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Check if user is admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session && session.user.role !== 'admin') {
      router.push('/dashboard')
      toast.error('Admin access required')
    }
  }, [session, status, router])

  // Fetch data on mount
  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchData()
    }
  }, [session]

  )

  // Set page title
  useEffect(() => {
    document.title = "Newsletter Management | Multigyan"
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch subscribers
      const subscribersRes = await fetch('/api/newsletters?limit=100')
      const subscribersData = await subscribersRes.json()

      if (subscribersData.success) {
        setSubscribers(subscribersData.subscribers)
        setStats(subscribersData.stats)
      }

      // Fetch campaigns
      const campaignsRes = await fetch('/api/admin/newsletter/campaigns?limit=50')
      const campaignsData = await campaignsRes.json()

      if (campaignsData.success) {
        setCampaigns(campaignsData.campaigns)
      }

    } catch (error) {
      console.error('Error fetching newsletter data:', error)
      toast.error('Failed to load newsletter data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCampaign = async (campaignId) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return

    try {
      const res = await fetch(`/api/admin/newsletter/campaigns/${campaignId}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Campaign deleted successfully')
        fetchData()
      } else {
        toast.error(data.error || 'Failed to delete campaign')
      }
    } catch (error) {
      console.error('Error deleting campaign:', error)
      toast.error('Failed to delete campaign')
    }
  }

  const handleDeleteSubscriber = async (subscriberId) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) return

    try {
      const res = await fetch(`/api/newsletters/${subscriberId}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Subscriber deleted successfully')
        fetchData()
      } else {
        toast.error(data.error || 'Failed to delete subscriber')
      }
    } catch (error) {
      console.error('Error deleting subscriber:', error)
      toast.error('Failed to delete subscriber')
    }
  }

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.subject.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || campaign.status === filterStatus
    return matchesSearch && matchesFilter
  })

  // Filter subscribers
  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = subscriber.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Newsletter Management</h1>
        <p className="text-muted-foreground">
          Manage your subscribers and create newsletter campaigns
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-lg p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Subscribers</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-10 w-10 text-primary opacity-20" />
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active</p>
                <p className="text-3xl font-bold text-green-500">{stats.active}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Campaigns Sent</p>
                <p className="text-3xl font-bold">{campaigns.filter(c => c.status === 'sent').length}</p>
              </div>
              <Send className="h-10 w-10 text-primary opacity-20" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('subscribers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'subscribers'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                }`}
            >
              Subscribers ({subscribers.length})
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'campaigns'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                }`}
            >
              Campaigns ({campaigns.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Quick Actions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/dashboard/admin/newsletter/create">
              <div className="bg-card border rounded-lg p-6 hover:shadow-lg transition cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Create Campaign</h3>
                    <p className="text-sm text-muted-foreground">
                      Create and send a new newsletter
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <div
              onClick={fetchData}
              className="bg-card border rounded-lg p-6 hover:shadow-lg transition cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-blue-500/10 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">View Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Track campaign performance
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Campaigns */}
          <div>
            <h3 className="text-xl font-bold mb-4">Recent Campaigns</h3>
            <div className="space-y-3">
              {campaigns.slice(0, 5).map(campaign => (
                <div key={campaign._id} className="bg-card border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{campaign.title}</h4>
                      <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${campaign.status === 'sent' ? 'bg-green-100 text-green-700' :
                          campaign.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                            campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                              campaign.status === 'sending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                        }`}>
                        {campaign.status}
                      </span>
                      <Link href={`/dashboard/admin/newsletter/campaigns/${campaign._id}`}>
                        <button className="p-2 hover:bg-accent rounded">
                          <Eye className="h-4 w-4" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Subscribers Tab */}
      {activeTab === 'subscribers' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search subscribers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="bg-card border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Subscribed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredSubscribers.map(subscriber => (
                  <tr key={subscriber.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{subscriber.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${subscriber.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {subscriber.isActive ? 'Active' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(subscriber.subscribedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {subscriber.source}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteSubscriber(subscriber.id)}
                        className="text-red-600 hover:text-red-900 p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="sending">Sending</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <Link href="/dashboard/admin/newsletter/create">
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create Campaign</span>
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredCampaigns.map(campaign => (
              <div key={campaign._id} className="bg-card border rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{campaign.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${campaign.status === 'sent' ? 'bg-green-100 text-green-700' :
                          campaign.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                            campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                              campaign.status === 'sending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                        }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{campaign.subject}</p>

                    {campaign.status === 'sent' && (
                      <div className="flex items-center space-x-6 text-sm">
                        <div>
                          <span className="text-muted-foreground">Sent:</span>
                          <span className="ml-1 font-medium">{campaign.analytics.sentCount}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Opens:</span>
                          <span className="ml-1 font-medium">{campaign.analytics.openCount}</span>
                          <span className="text-xs text-muted-foreground ml-1">({campaign.openRate}%)</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Clicks:</span>
                          <span className="ml-1 font-medium">{campaign.analytics.clickCount}</span>
                          <span className="text-xs text-muted-foreground ml-1">({campaign.clickRate}%)</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link href={`/dashboard/admin/newsletter/campaigns/${campaign._id}`}>
                      <button className="p-2 hover:bg-accent rounded">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                    {campaign.status !== 'sent' && (
                      <>
                        <Link href={`/dashboard/admin/newsletter/campaigns/${campaign._id}/edit`}>
                          <button className="p-2 hover:bg-accent rounded">
                            <Edit className="h-4 w-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDeleteCampaign(campaign._id)}
                          className="p-2 hover:bg-accent rounded text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredCampaigns.length === 0 && (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No campaigns found</p>
                <Link href="/dashboard/admin/newsletter/create">
                  <button className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90">
                    Create Your First Campaign
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
