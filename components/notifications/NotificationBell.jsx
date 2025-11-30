"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Heart, MessageCircle, UserPlus, Check, X, Loader2, User, FileText } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import useSWR from "swr"

const fetcher = (...args) => fetch(...args).then(res => res.json())

export default function NotificationBell() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Use SWR for fetching notifications
  // Only fetch if user is authenticated
  // Refresh every 60 seconds, but pause when window is hidden (default SWR behavior)
  const { data, mutate } = useSWR(
    session?.user ? '/api/notifications?limit=10' : null,
    fetcher,
    {
      refreshInterval: 300000, // 5 minutes
      revalidateOnFocus: true,
      dedupingInterval: 5000,
      keepPreviousData: true
    }
  )

  const notifications = data?.notifications || []
  const unreadCount = data?.unreadCount || 0

  const markAsRead = async (notificationIds) => {
    try {
      // Optimistic update
      mutate(
        {
          ...data,
          unreadCount: Math.max(0, unreadCount - notificationIds.length),
          notifications: notifications.map(n =>
            notificationIds.includes(n._id) ? { ...n, isRead: true } : n
          )
        },
        false // Don't revalidate immediately
      )

      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds })
      })

      if (response.ok) {
        // Revalidate to get the true server state
        mutate()
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error)
      // Revert on error
      mutate()
    }
  }

  const markAllAsRead = async () => {
    setActionLoading(true)
    try {
      // Optimistic update
      mutate(
        {
          ...data,
          unreadCount: 0,
          notifications: notifications.map(n => ({ ...n, isRead: true }))
        },
        false
      )

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
        mutate() // Revert
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast.error('Failed to mark notifications as read')
      mutate()
    } finally {
      setActionLoading(false)
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      // Optimistic update
      const deletedNotif = notifications.find(n => n._id === notificationId)
      const wasUnread = deletedNotif && !deletedNotif.isRead

      mutate(
        {
          ...data,
          unreadCount: wasUnread ? Math.max(0, unreadCount - 1) : unreadCount,
          notifications: notifications.filter(n => n._id !== notificationId)
        },
        false
      )

      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Notification deleted')
        mutate()
      } else {
        mutate() // Revert
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
    setOpen(false)
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like_post':
      case 'like_comment':
        return <Heart className="h-4 w-4 text-red-500" />
      case 'comment_post':
      case 'reply_comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      case 'follow':
        return <UserPlus className="h-4 w-4 text-green-500" />
      case 'post_published':
        return <FileText className="h-4 w-4 text-purple-500" />
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />
    }
  }

  if (!session?.user) {
    return null
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[95vw] sm:w-96 max-h-[80vh] sm:max-h-[600px] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-background z-10">
          <DropdownMenuLabel className="p-0 font-bold text-lg">
            Notifications
          </DropdownMenuLabel>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              disabled={actionLoading}
              className="h-8 text-xs"
            >
              {actionLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Mark all read
                </>
              )}
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm">No notifications yet</p>
            <p className="text-xs mt-1">When you get notifications, they'll show up here</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <Link
                key={notification._id}
                href={notification.link}
                onClick={() => handleNotificationClick(notification)}
                className="block"
              >
                <div
                  className={cn(
                    "px-4 py-3 hover:bg-muted/50 transition-colors relative group",
                    !notification.isRead && "bg-primary/5"
                  )}
                >
                  {/* Unread Indicator */}
                  {!notification.isRead && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full" />
                  )}

                  <div className="flex gap-3 ml-3">
                    {/* Sender Avatar */}
                    <div className="flex-shrink-0">
                      {notification.sender?.profilePictureUrl ? (
                        <Image
                          src={notification.sender.profilePictureUrl}
                          alt={notification.sender.name || 'User'}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        {/* Icon */}
                        <div className="mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Message */}
                        <div className="flex-1">
                          <p className="text-sm leading-snug break-words">
                            {notification.message}
                          </p>

                          {/* Post Title */}
                          {notification.post?.title && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1 break-words">
                              "{notification.post.title}"
                            </p>
                          )}

                          {/* Time */}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        deleteNotification(notification._id)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Link href="/dashboard/notifications">
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setOpen(false)}
                >
                  View All Notifications
                </Button>
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
