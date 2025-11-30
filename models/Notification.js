import mongoose from 'mongoose'

const NotificationSchema = new mongoose.Schema({
  // Who receives this notification
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Who triggered this notification
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Type of notification
  type: {
    type: String,
    enum: [
      'like_post',        // Someone liked your post
      'like_comment',     // Someone liked your comment
      'comment_post',     // Someone commented on your post
      'reply_comment',    // Someone replied to your comment
      'follow',           // Someone followed you
      'mention',          // Someone mentioned you
      'post_published',   // Your post was published (admin approval)
      'post_edited_by_admin',  // Admin edited your post
      'post_revision_pending'  // Your edited post needs admin approval
    ],
    required: true
  },

  // Related content
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },

  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },

  // Notification message
  message: {
    type: String,
    required: true
  },

  // Link to go to when clicked
  link: {
    type: String,
    required: true
  },

  // Additional metadata for notifications
  metadata: {
    editReason: String,      // Reason for editing (admin only)
    changes: String,         // Description of changes made
    postTitle: String        // Title of the post for context
  },

  // Read status
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },

  // Email sent status
  emailSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Indexes for performance
NotificationSchema.index({ recipient: 1, createdAt: -1 })
NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 })

// Static method to create notification
NotificationSchema.statics.createNotification = async function ({
  recipient,
  sender,
  type,
  post,
  comment,
  message,
  link
}) {
  // Don't create notification if sender is the same as recipient
  if (recipient.toString() === sender.toString()) {
    return null
  }

  // Check if user has notification settings enabled
  const User = mongoose.model('User')
  const recipientUser = await User.findById(recipient)

  if (!recipientUser || !recipientUser.settings) {
    return null
  }

  // Check notification preferences
  const { settings } = recipientUser
  let shouldCreate = false

  switch (type) {
    case 'comment_post':
    case 'reply_comment':
      shouldCreate = settings.commentNotifications !== false
      break
    case 'like_post':
    case 'like_comment':
      shouldCreate = settings.likeNotifications === true
      break
    case 'follow':
      shouldCreate = settings.newFollowerNotifications !== false
      break
    default:
      shouldCreate = settings.emailNotifications !== false
  }

  if (!shouldCreate) {
    return null
  }

  // Check for duplicate notification in last 5 minutes (deduplication)
  const recentDuplicate = await this.findOne({
    recipient,
    sender,
    type,
    post: post || null,
    comment: comment || null,
    createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
  })

  if (recentDuplicate) {
    // Update the timestamp to show it's still relevant
    recentDuplicate.createdAt = new Date()
    await recentDuplicate.save()
    return recentDuplicate
  }

  // Create the notification
  const notification = await this.create({
    recipient,
    sender,
    type,
    post,
    comment,
    message,
    link
  })

  return notification
}

// Static method to create bulk notifications (for batch operations)
NotificationSchema.statics.createBulkNotifications = async function (notifications) {
  if (!notifications || notifications.length === 0) {
    return []
  }

  const User = mongoose.model('User')
  const validNotifications = []

  // Batch fetch all unique recipients
  const recipientIds = [...new Set(notifications.map(n => n.recipient.toString()))]
  const recipients = await User.find({ _id: { $in: recipientIds } }).select('settings').lean()
  const recipientMap = new Map(recipients.map(r => [r._id.toString(), r]))

  for (const notif of notifications) {
    // Skip self-notifications
    if (notif.recipient.toString() === notif.sender.toString()) {
      continue
    }

    // Check user preferences
    const recipientUser = recipientMap.get(notif.recipient.toString())
    if (!recipientUser || !recipientUser.settings) {
      continue
    }

    const { settings } = recipientUser
    let shouldCreate = false

    switch (notif.type) {
      case 'comment_post':
      case 'reply_comment':
        shouldCreate = settings.commentNotifications !== false
        break
      case 'like_post':
      case 'like_comment':
        shouldCreate = settings.likeNotifications === true
        break
      case 'follow':
        shouldCreate = settings.newFollowerNotifications !== false
        break
      default:
        shouldCreate = settings.emailNotifications !== false
    }

    if (shouldCreate) {
      validNotifications.push(notif)
    }
  }

  if (validNotifications.length === 0) {
    return []
  }

  // Insert all valid notifications in one operation
  try {
    return await this.insertMany(validNotifications, { ordered: false })
  } catch (error) {
    // Some might fail due to duplicates, that's okay
    console.error('Bulk notification creation error:', error)
    return []
  }
}

// Static method to mark as read
NotificationSchema.statics.markAsRead = async function (notificationIds, userId) {
  await this.updateMany(
    {
      _id: { $in: notificationIds },
      recipient: userId
    },
    { isRead: true }
  )
}

// Static method to mark all as read for a user
NotificationSchema.statics.markAllAsRead = async function (userId) {
  const result = await this.updateMany(
    { recipient: userId, isRead: false },
    { $set: { isRead: true } }
  )
  return result
}

// Static method to get unread count
NotificationSchema.statics.getUnreadCount = async function (userId) {
  return await this.countDocuments({
    recipient: userId,
    isRead: false
  })
}

// Static method to delete old notifications
NotificationSchema.statics.deleteOldNotifications = async function (daysOld = 90) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)

  await this.deleteMany({
    createdAt: { $lt: cutoffDate },
    isRead: true
  })
}

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema)
