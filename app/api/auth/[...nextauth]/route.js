import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import logger from '@/lib/logger'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        try {
          await connectDB()

          // Find user with password field
          const user = await User.findByEmailWithPassword(credentials.email)

          if (!user) {
            throw new Error('No user found with this email')
          }

          if (!user.isActive) {
            throw new Error('Account is deactivated')
          }

          // Check password
          const isPasswordValid = await user.comparePassword(credentials.password)

          if (!isPasswordValid) {
            throw new Error('Invalid password')
          }

          // Update last login
          user.lastLoginAt = new Date()
          await user.save()

          // Return user object (without password)
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role,
            bio: user.bio,
            profilePictureUrl: user.profilePictureUrl,
            twitterHandle: user.twitterHandle,
            linkedinUrl: user.linkedinUrl,
            website: user.website,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt
          }
        } catch (error) {
          logger.error('Auth error:', { error: error.message })
          throw new Error(error.message)
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.username = user.username
        token.role = user.role
        token.bio = user.bio
        token.profilePictureUrl = user.profilePictureUrl
        token.twitterHandle = user.twitterHandle
        token.linkedinUrl = user.linkedinUrl
        token.website = user.website
        token.emailVerified = user.emailVerified
        token.createdAt = user.createdAt
      }

      // Handle session updates (when update() is called)
      if (trigger === 'update' && session) {
        // Update token with new session data
        token.name = session.user.name || token.name
        token.username = session.user.username || token.username
        token.bio = session.user.bio || token.bio
        token.profilePictureUrl = session.user.profilePictureUrl || token.profilePictureUrl
        token.twitterHandle = session.user.twitterHandle || token.twitterHandle
        token.linkedinUrl = session.user.linkedinUrl || token.linkedinUrl
        token.website = session.user.website || token.website
      }

      return token
    },
    async session({ session, token }) {
      // Send user data to the client
      if (token) {
        session.user.id = token.sub || token.id
        session.user.username = token.username
        session.user.role = token.role
        session.user.bio = token.bio
        session.user.profilePictureUrl = token.profilePictureUrl
        session.user.twitterHandle = token.twitterHandle
        session.user.linkedinUrl = token.linkedinUrl
        session.user.website = token.website
        session.user.emailVerified = token.emailVerified
        session.user.createdAt = token.createdAt
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    signUp: '/register',
    error: '/auth/error'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  // ✅ Cookie configuration for custom domain
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
        domain: process.env.NODE_ENV === 'production' ? '.multigyan.in' : undefined
      }
    }
  },
  useSecureCookies: true,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
