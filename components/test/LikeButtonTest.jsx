"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import LikeButton, { PostLikeButton, CommentLikeButton, QuickLikeIcon } from '@/components/interactions/LikeButton'
import LikeButtonWithUsers from '@/components/interactions/LikeButtonWithUsers'

/**
 * Test component to verify all Like button variants work correctly
 * Use this for testing during development
 */
export default function LikeButtonTest() {
  const [testData, setTestData] = useState({
    post: {
      id: 'test-post-1',
      likes: ['user1', 'user2', 'user3'],
    },
    comment: {
      id: 'test-comment-1',
      likes: ['user1', 'user4'],
    }
  })

  const handleLikeChange = (type) => (data) => {
    console.log(`${type} like changed:`, data)
    setTestData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        likes: data.isLiked 
          ? [...prev[type].likes, 'current-user']
          : prev[type].likes.filter(id => id !== 'current-user')
      }
    }))
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Like Button Test Suite</h1>
        <p className="text-muted-foreground">
          Test all variants of the Like button component
        </p>
      </div>

      {/* Basic Like Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Like Buttons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium">Default Button Variant</h3>
            <LikeButton
              type="post"
              targetId={testData.post.id}
              initialLikes={testData.post.likes}
              onLikeChange={handleLikeChange('post')}
              variant="button"
              size="md"
            />
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Icon Variant</h3>
            <LikeButton
              type="post"
              targetId={testData.post.id}
              initialLikes={testData.post.likes}
              onLikeChange={handleLikeChange('post')}
              variant="icon"
              size="md"
            />
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Minimal Variant</h3>
            <LikeButton
              type="comment"
              targetId={testData.comment.id}
              postId={testData.post.id}
              initialLikes={testData.comment.likes}
              onLikeChange={handleLikeChange('comment')}
              variant="minimal"
              size="sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pre-configured Components */}
      <Card>
        <CardHeader>
          <CardTitle>Pre-configured Components</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium">PostLikeButton</h3>
            <PostLikeButton
              targetId={testData.post.id}
              initialLikes={testData.post.likes}
              onLikeChange={handleLikeChange('post')}
            />
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">CommentLikeButton</h3>
            <CommentLikeButton
              targetId={testData.comment.id}
              postId={testData.post.id}
              initialLikes={testData.comment.likes}
              onLikeChange={handleLikeChange('comment')}
            />
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">QuickLikeIcon</h3>
            <QuickLikeIcon
              type="post"
              targetId={testData.post.id}
              initialLikes={testData.post.likes}
              onLikeChange={handleLikeChange('post')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Size Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Size Variants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Small</h4>
              <LikeButton
                type="post"
                targetId={testData.post.id}
                initialLikes={testData.post.likes}
                size="sm"
                variant="button"
              />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Medium</h4>
              <LikeButton
                type="post"
                targetId={testData.post.id}
                initialLikes={testData.post.likes}
                size="md"
                variant="button"
              />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Large</h4>
              <LikeButton
                type="post"
                targetId={testData.post.id}
                initialLikes={testData.post.likes}
                size="lg"
                variant="button"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Features */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium">Disabled State</h3>
            <LikeButton
              type="post"
              targetId={testData.post.id}
              initialLikes={testData.post.likes}
              disabled={true}
              variant="button"
            />
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Without Animation</h3>
            <LikeButton
              type="post"
              targetId={testData.post.id}
              initialLikes={testData.post.likes}
              animated={false}
              variant="button"
            />
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Hide Count</h3>
            <LikeButton
              type="post"
              targetId={testData.post.id}
              initialLikes={testData.post.likes}
              showCount={false}
              variant="button"
            />
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Enhanced with User List</h3>
            <LikeButtonWithUsers
              type="post"
              targetId={testData.post.id}
              initialLikes={testData.post.likes}
              showUsersWhoLiked={true}
            />
          </div>
        </CardContent>
      </Card>

      {/* Current State */}
      <Card>
        <CardHeader>
          <CardTitle>Current Test Data</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded text-sm overflow-auto">
            {JSON.stringify(testData, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
