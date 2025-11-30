"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Check,
  Trash2,
  Loader2,
  User,
  FileText,
  Filter,
  RefreshCw,
  CheckCheck
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import useSWRInfinite from "swr/infinite"

const fetcher = (...args) => fetch(...args).then(res => res.json())

export default function NotificationsPage() {
  const { data: session } = useSession()
  const [filter, setFilter] = useState('all') // 'all' | 'unread'
  const [typeFilter, setTypeFilter] = useState('all') // 'all' | specific type
  const [actionLoading, setActionLoading] = useState(false)

  // Set page title
  useEffect(() => {
    document.title = "Notifications | Multigyan"
  }, [])

  const getKey = (pageIndex, previousPageData) => {
    // Reached the end
    if (previousPageData && !previousPageData.notifications?.length) return null

    let url = `/api/notifications?limit=20&page=${pageIndex + 1}`
    if (filter === 'unread') url += '&unreadOnly=true'

    return url
  }

  const { data, error, size, setSize, mutate, isLoading, isValidating } = useSWRInfinite(
    getKey,
    fetcher,
    {
      revalidateFirstPage: false,
      revalidateOnFocus: true
    }
  )

  const notifications = data ? data.flatMap(page => page.notifications) : []
  const unreadCount = data?.[0]?.unreadCount || 0
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined")
  const isEmpty = data?.[0]?.notifications?.length === 0
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.notifications?.length < 20)
  const isRefreshing = isValidating && data && data.length === size

  const refreshNotifications = () => {
    mutate()
    toast.success('Notifications refreshed')
  }

  const markAsRead = async (notificationIds) => {
    try {
      // Optimistic update
      const newPages = data.map(page => ({
        ...page,
        unreadCount: Math.max(0, page.unreadCount - notificationIds.length),
        notifications: page.notifications.map(n =>
          notificationIds.includes(n._id) ? { ...n, isRead: true } : n
        )
      }))

      mutate(newPages, false)

      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds })
      })

      if (response.ok) {
        mutate() // Revalidate
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error)
      mutate() // Revert
    }
  }

  const markAllAsRead = async () => {
    setActionLoading(true)
    try {
      // Optimistic update
      const newPages = data.map(page => ({
        ...page,
        unreadCount: 0,
        notifications: page.notifications.map(n => ({ ...n, isRead: true }))
      }))

      mutate(newPages, false)

      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true })
      })

      if (response.ok) {
        toast.success('All notifications marked as read')
        mutate()
      } else {
        toast.error('Failed to mark notifications as read')
        mutate()
      }
    } catch (error) {
      toast.error('Failed to mark notifications as read')
      mutate()
    } finally {
      setActionLoading(false)
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      // Optimistic update
      const newPages = data.map(page => ({
        ...page,
        notifications: page.notifications.filter(n => n._id !== notificationId)
      }))

      mutate(newPages, false)

      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Notification deleted')
        mutate()
      } else {
        mutate()
      }
    } catch (error) {
      toast.error('Failed to delete notification')
      mutate()
    }
  }

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead([notification._id])
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like_post':
      case 'like_comment':
        return <Heart className="h-5 w-5 text-red-500" />
      case 'comment_post':
      case 'reply_comment':
        return <MessageCircle className="h-5 w-5 text-blue-500" />
      case 'follow':
        return <UserPlus className="h-5 w-5 text-green-500" />
      case 'post_published':
        return <FileText className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'like_post': return 'Post Like'
      case 'like_comment': return 'Comment Like'
      case 'comment_post': return 'New Comment'
      case 'reply_comment': return 'Comment Reply'
      case 'follow': return 'New Follower'
      case 'post_published': return 'Post Published'
      default: return 'Notification'
    }
  }

  const filteredNotifications = typeFilter === 'all'
    ? notifications
    : notifications.filter(n => n.type === typeFilter)

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold">Notifications</h1>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {unreadCount} unread
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={refreshNotifications}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              <span className="ml-2 hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          Stay updated with all your activities
        </p>
      </div>

      {/* Actions Bar */}
      <Card className="mb-4 sm:mb-6">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            {/* Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
                className="flex-shrink-0"
              >
                <Bell className="h-4 w-4 mr-2" />
                All
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
                className="flex-shrink-0"
              >
                <Filter className="h-4 w-4 mr-2" />
                Unread
              </Button>
            </div>

            {/* Mark All Read Button */}
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={actionLoading}
                className="flex-shrink-0"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCheck className="h-4 w-4 mr-2" />
                )}
                <span className="hidden sm:inline">Mark all read</span>
                <span className="sm:hidden">Mark all</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      {isLoading && !data ? (
        <Card>
          <CardContent className="p-8 sm:p-12">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading notifications...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="p-8 sm:p-12">
            <div className="text-center">
              <Bell className="h-12 sm:h-16 w-12 sm:w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-6">
                {filter === 'unread'
                  ? "You're all caught up!"
                  : "When you get notifications, they'll show up here"
                }
              </p>
              {filter === 'unread' && (
                <Button
                  variant="outline"
                  onClick={() => setFilter('all')}
                >
                  View all notifications
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification._id}
                className={cn(
                  "transition-all hover:shadow-md",
                  !notification.isRead && "border-l-4 border-l-primary bg-primary/5"
                )}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex gap-3 sm:gap-4">
                    {/* Sender Avatar */}
                    <div className="flex-shrink-0">
                      {notification.sender?.profilePictureUrl ? (
                        <Image
                          src={notification.sender.profilePictureUrl}
                          alt={notification.sender.name || 'User'}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getNotificationIcon(notification.type)}
                          <Badge variant="secondary" className="text-xs">
                            {getTypeLabel(notification.type)}
                          </Badge>
                          {!notification.isRead && (
                            <Badge variant="default" className="text-xs">New</Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead([notification._id])}
                              className="h-8"
                            >
                              <Check className="h-4 w-4" />
                              <span className="ml-1 hidden sm:inline">Mark read</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification._id)}
                            className="h-8"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      <Link
                        href={notification.link}
                        onClick={() => handleNotificationClick(notification)}
                        className="block group"
                      >
                        <p className="text-sm sm:text-base mb-2 group-hover:text-primary transition-colors break-words">
                          {notification.message}
                        </p>

                        {notification.post?.title && (
                          <p className="text-xs sm:text-sm text-muted-foreground mb-2 italic line-clamp-2 break-words">
                            &quot;{notification.post.title}&quot;
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                          <span>•</span>
                          <span className="hidden sm:inline">
                            {format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More Button */}
          {!isReachingEnd && (
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={() => setSize(size + 1)}
                disabled={isLoadingMore}
                className="w-full sm:w-auto"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
