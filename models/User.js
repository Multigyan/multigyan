import mongoose from 'mongoose'
import bcryptjs from 'bcryptjs'

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  username: {
    type: String,
    unique: true,
    sparse: true, // Allows null values to be non-unique
    lowercase: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot be more than 30 characters'],
    match: [
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, hyphens, and underscores'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't return password in queries by default
  },
  role: {
    type: String,
    enum: ['author', 'admin'],
    default: 'author'
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters'],
    trim: true
  },
  profilePictureUrl: {
    type: String,
    default: null
  },
  // Social Media Links
  twitterHandle: {
    type: String,
    trim: true,
    maxlength: [50, 'Twitter handle cannot be more than 50 characters']
  },
  linkedinUrl: {
    type: String,
    trim: true,
    maxlength: [200, 'LinkedIn URL cannot be more than 200 characters']
  },
  website: {
    type: String,
    trim: true,
    maxlength: [200, 'Website URL cannot be more than 200 characters']
  },
  // User Settings
  settings: {
    // Notification Settings
    emailNotifications: { type: Boolean, default: true },
    commentNotifications: { type: Boolean, default: true },
    likeNotifications: { type: Boolean, default: false },
    newFollowerNotifications: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: true },
    
    // Privacy Settings
    profileVisibility: { type: Boolean, default: true },
    showEmail: { type: Boolean, default: false },
    showJoinDate: { type: Boolean, default: true },
    allowFollowing: { type: Boolean, default: true },
    
    // Content Settings
    autoSaveDrafts: { type: Boolean, default: true },
    defaultPostVisibility: { type: String, enum: ['public', 'private'], default: 'public' },
    allowComments: { type: Boolean, default: true },
    moderateComments: { type: Boolean, default: false },
    
    // Display Settings
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    language: { type: String, default: 'en' },
    postsPerPage: { type: Number, min: 5, max: 50, default: 10 },
    
    // Security Settings
    twoFactorEnabled: { type: Boolean, default: false },
    loginAlerts: { type: Boolean, default: true }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLoginAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Index for better query performance
// Note: email index is already created by unique: true in schema
UserSchema.index({ role: 1 })
UserSchema.index({ username: 1 })
UserSchema.index({ createdAt: -1 })

// Virtual for user's full profile
UserSchema.virtual('profile').get(function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    username: this.username,
    role: this.role,
    bio: this.bio,
    profilePictureUrl: this.profilePictureUrl,
    twitterHandle: this.twitterHandle,
    linkedinUrl: this.linkedinUrl,
    website: this.website,
    settings: this.settings,
    isActive: this.isActive,
    emailVerified: this.emailVerified,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
})

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Only hash password if it has been modified (or is new)
  if (!this.isModified('password')) return next()
  
  try {
    // Hash password with cost of 12
    const hashedPassword = await bcryptjs.hash(this.password, 12)
    this.password = hashedPassword
    next()
  } catch (error) {
    next(error)
  }
})

// Instance method to check password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcryptjs.compare(candidatePassword, this.password)
  } catch (error) {
    throw new Error('Error comparing passwords')
  }
}

// Static method to find user by email with password
UserSchema.statics.findByEmailWithPassword = function(email) {
  return this.findOne({ email }).select('+password')
}

// Static method to promote user to admin
UserSchema.statics.promoteToAdmin = async function(userId, promotedBy) {
  const user = await this.findById(userId)
  if (!user) {
    throw new Error('User not found')
  }
  
  user.role = 'admin'
  await user.save()
  
  return user
}

// Static method to demote admin to author
UserSchema.statics.demoteToAuthor = async function(userId, demotedBy) {
  const user = await this.findById(userId)
  if (!user) {
    throw new Error('User not found')
  }
  
  // Prevent self-demotion
  if (userId.toString() === demotedBy.toString()) {
    throw new Error('Cannot demote yourself')
  }
  
  user.role = 'author'
  await user.save()
  
  return user
}

// Static method to get admin count
UserSchema.statics.getAdminCount = function() {
  return this.countDocuments({ role: 'admin', isActive: true })
}

// Static method to check if user can be promoted to admin
UserSchema.statics.canPromoteToAdmin = async function() {
  const adminCount = await this.getAdminCount()
  const MAX_ADMINS = process.env.MAX_ADMINS || 3
  return adminCount < MAX_ADMINS
}

export default mongoose.models.User || mongoose.model('User', UserSchema)