// Export all models for easy importing
export { default as User } from './User.js'
export { default as Post } from './Post.js'
export { default as Category } from './Category.js'
export { default as Newsletter } from './Newsletter.js'
export { default as NewsletterCampaign } from './NewsletterCampaign.js'

// Model utilities and constants
export const USER_ROLES = {
  AUTHOR: 'author',
  ADMIN: 'admin'
}

export const POST_STATUS = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  PUBLISHED: 'published',
  REJECTED: 'rejected'
}

// Default categories to seed the database
export const DEFAULT_CATEGORIES = [
  {
    name: 'Technology',
    description: 'Latest trends and insights in technology',
    color: '#3B82F6',
    icon: 'laptop'
  },
  {
    name: 'Programming',
    description: 'Code tutorials, tips, and best practices',
    color: '#10B981',
    icon: 'code'
  },
  {
    name: 'Web Development',
    description: 'Frontend, backend, and full-stack development',
    color: '#F59E0B',
    icon: 'globe'
  },
  {
    name: 'Design',
    description: 'UI/UX design principles and inspiration',
    color: '#EF4444',
    icon: 'palette'
  },
  {
    name: 'Career',
    description: 'Professional development and career advice',
    color: '#8B5CF6',
    icon: 'briefcase'
  },
  {
    name: 'Tutorials',
    description: 'Step-by-step guides and how-to articles',
    color: '#06B6D4',
    icon: 'book'
  }
]