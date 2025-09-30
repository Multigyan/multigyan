import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import connectDB from '@/lib/mongodb'
import { User } from '@/models'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { 
          label: 'Email', 
          type: 'email',
          placeholder: 'your@email.com'
        },
        password: { 
          label: 'Password', 
          type: 'password' 
        }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        try {
          await connectDB()
          
          // Find user by email and include password for verification
          const user = await User.findOne({ 
            email: credentials.email.toLowerCase() 
          }).select('+password')

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
          user.lastLogin = new Date()
          await user.save()

          // Return user object (without password)
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            profilePictureUrl: user.profilePictureUrl,
            isVerified: user.isVerified
          }
        } catch (error) {
          console.error('Authentication error:', error)
          throw new Error(error.message || 'Authentication failed')
        }
      }
    })
  ],
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.role = user.role
        token.id = user.id
        token.isVerified = user.isVerified
        token.profilePictureUrl = user.profilePictureUrl
      }
      return token
    },
    
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.isVerified = token.isVerified
        session.user.profilePictureUrl = token.profilePictureUrl
      }
      return session
    }
  },
  
  pages: {
    signIn: '/login',
    signUp: '/register',
    error: '/auth/error'
  },
  
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`✅ User signed in: ${user.email}`)
    },
    async signOut({ session, token }) {
      console.log(`👋 User signed out: ${session?.user?.email || 'Unknown'}`)
    }
  },
  
  debug: process.env.NODE_ENV === 'development',
  
  secret: process.env.NEXTAUTH_SECRET
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }