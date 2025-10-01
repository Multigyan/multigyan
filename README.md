# 🎓 Multigyan - Multi-Author Blogging Platform

![Multigyan Logo](./public/Multigyan_Logo.png)

A modern, feature-rich multi-author blogging platform built with Next.js 15, MongoDB, and NextAuth. Designed for teams of writers and content creators to collaborate and publish amazing content.

## 🚀 Live Demo

- **Website**: [http://localhost:3000](http://localhost:3000) (Development)
- **Admin Panel**: [http://localhost:3000/dashboard/admin](http://localhost:3000/dashboard/admin)

---

## ✨ Features

### 🎨 **User Experience**
- ✅ Modern, responsive UI with Tailwind CSS
- ✅ Dark/Light theme support
- ✅ Professional image cropping with zoom & rotate
- ✅ Real-time username availability checking
- ✅ SEO-friendly URLs with slugs
- ✅ Social sharing capabilities
- ✅ Mobile-first responsive design
- ✅ Smooth animations and transitions

### 👤 **User Management**
- ✅ Secure authentication with NextAuth
- ✅ Email & password authentication
- ✅ Role-based access control (Admin/Author)
- ✅ User profiles with customization
- ✅ Profile picture upload (Cloudinary integration)
- ✅ Unique username system
- ✅ Bio, social links (Twitter, LinkedIn, Website)
- ✅ Email verification system
- ✅ Follow/Unfollow system
- ✅ Follower & following counts

### 📝 **Content Management**
- ✅ Rich text editor (TiptapEditor)
- ✅ Code syntax highlighting
- ✅ Image upload and management
- ✅ Draft & published states
- ✅ Post approval workflow
- ✅ Categories and tags
- ✅ SEO meta tags
- ✅ Reading time estimation
- ✅ View count tracking
- ✅ Like system for posts

### 💬 **Comments & Engagement**
- ✅ Multi-level comment system
- ✅ Guest comments support
- ✅ Comment replies
- ✅ Comment likes
- ✅ Comment moderation & approval
- ✅ Admin auto-approval
- ✅ Comment reporting
- ✅ Edit and delete comments

### 🔔 **Notification System** (NEW!)
- ✅ Real-time notifications
- ✅ Notification bell with badge counter
- ✅ Desktop dropdown notifications
- ✅ Mobile-responsive notification view
- ✅ Notification types:
  - Post likes
  - Comment on posts
  - Reply to comments
  - Comment likes
  - New followers
  - Post approval/publish
- ✅ Mark as read/unread
- ✅ Mark all as read
- ✅ Delete notifications
- ✅ Auto-refresh every 30 seconds
- ✅ Notification preferences in settings
- ✅ Full notifications dashboard page
- ✅ Filter by read/unread
- ✅ Pagination support
- ✅ Mobile-optimized dropdown

### 📊 **Statistics & Analytics**
- ✅ User statistics (posts, views, likes, followers)
- ✅ Post statistics (views, likes, comments)
- ✅ Dashboard with key metrics
- ✅ Profile analytics
- ✅ Real-time stat updates
- ✅ Comment count tracking

### 🔍 **Discovery & Social**
- ✅ Public profile pages
- ✅ Author pages with all posts
- ✅ Follow system
- ✅ Social sharing (Twitter, Facebook, LinkedIn)
- ✅ Open Graph meta tags
- ✅ Twitter Card integration
- ✅ Search functionality
- ✅ Category browsing
- ✅ Authors directory

### 🛡️ **Admin Features**
- ✅ Admin dashboard
- ✅ User management
- ✅ Content moderation
- ✅ Post approval system
- ✅ Comment moderation
- ✅ Role management
- ✅ System settings
- ✅ Analytics overview

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 15.5.3 (App Router)
- **Language**: JavaScript/JSX (100% JavaScript, No TypeScript)
- **Styling**: Tailwind CSS 3.4
- **UI Components**: 
  - Radix UI primitives
  - Shadcn/ui components
  - Lucide React icons
- **Rich Text Editor**: TiptapEditor with extensions
- **Image Handling**: 
  - Next.js Image optimization
  - React Easy Crop
  - Browser Image Compression
- **State Management**: React Context + useState/useEffect
- **Notifications**: Sonner (Toast notifications)
- **Date Handling**: date-fns

### **Backend**
- **Framework**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js 4.24
- **Cloud Storage**: Cloudinary
- **File Upload**: Browser-native FormData API
- **Password Hashing**: bcryptjs

### **Developer Tools**
- **Linting**: ESLint
- **Package Manager**: npm
- **Development**: Turbopack (Next.js 15)
- **Code Quality**: JSConfig for path aliases

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Cloudinary account (for image uploads)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/multigyan.git
cd multigyan
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key

# Admin Configuration
INITIAL_ADMIN_EMAILS=admin1@example.com,admin2@example.com,admin3@example.com
MAX_ADMINS=3

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Cloudinary Public (Client-side uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Multigyan
NEXT_PUBLIC_SITE_DESCRIPTION=Multi-author blogging platform
NEXT_PUBLIC_TWITTER_HANDLE=@multigyan

# Development
NODE_ENV=development
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
multigyan/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Protected dashboard routes
│   │   └── dashboard/
│   │       ├── profile/     # User profile settings
│   │       ├── settings/    # User settings
│   │       ├── notifications/ # Notifications page (NEW)
│   │       ├── posts/       # Post management
│   │       └── admin/       # Admin panel
│   ├── api/                 # API routes
│   │   ├── auth/            # NextAuth configuration
│   │   ├── users/           # User management APIs
│   │   ├── posts/           # Post management APIs
│   │   ├── comments/        # Comment APIs (NEW)
│   │   └── notifications/   # Notification APIs (NEW)
│   ├── author/              # Author pages
│   ├── blog/                # Blog pages
│   ├── profile/             # Public profile pages
│   ├── categories/          # Category pages
│   └── layout.js            # Root layout
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── notifications/       # Notification components (NEW)
│   │   └── NotificationBell.jsx
│   ├── comments/            # Comment components (NEW)
│   ├── interactions/        # Like buttons, etc.
│   ├── upload/              # Image upload components
│   ├── image/               # Image manipulation
│   ├── editor/              # Rich text editor
│   └── Navbar.jsx           # Main navigation
├── lib/
│   ├── mongodb.js           # MongoDB connection
│   ├── helpers.js           # Utility functions
│   └── utils.js             # Tailwind utils
├── models/
│   ├── User.js              # User schema
│   ├── Post.js              # Post schema
│   ├── Notification.js      # Notification schema (NEW)
│   ├── Category.js          # Category schema
│   └── Newsletter.js        # Newsletter schema
├── public/                  # Static assets
├── .env.local              # Environment variables
├── jsconfig.json           # JavaScript configuration
├── next.config.mjs         # Next.js configuration
├── tailwind.config.js      # Tailwind CSS config
└── package.json            # Dependencies
```

---

## 🎯 Key Features Explained

### 1. **Authentication System**
- Secure JWT-based authentication using NextAuth
- Session management with automatic refresh
- Role-based access control (Admin/Author)
- Protected routes with middleware

### 2. **Profile Management**
- Public profile pages (`/profile/[username]`)
- Private profile settings
- Profile picture with cropping tool
- Real-time username validation
- Social media integration

### 3. **Follow System**
- Follow/Unfollow users
- Follower & following counts
- Real-time updates
- Statistics tracking
- Notifications for new followers

### 4. **Content Creation**
- Rich text editor with formatting
- Image upload and embedding
- Draft and publish workflow
- SEO optimization
- Reading time calculation
- Post approval system

### 5. **Comment System** (NEW!)
- Multi-level threaded comments
- Guest comments with email
- User comments (auto-approved for admins)
- Comment likes
- Reply to comments
- Comment moderation
- Edit and delete options
- Spam reporting

### 6. **Notification System** (NEW!)
- Real-time notification updates
- Bell icon with unread counter
- Desktop dropdown view
- Mobile-responsive design
- Multiple notification types
- Mark as read/unread
- Delete notifications
- Notification preferences
- Auto-refresh functionality
- Full dashboard page with filters

### 7. **Image Management**
- Professional image cropper
- Zoom, rotate, move functionality
- Upload to Cloudinary
- URL-based images
- Automatic optimization

### 8. **Social Features**
- Share profile button
- Open Graph meta tags
- Twitter Cards
- Responsive social icons
- Copy link to clipboard

---

## 🔐 User Roles

### **Author**
- Create and publish posts
- Edit own posts
- Manage own profile
- View analytics
- Follow other users
- Comment on posts
- Receive notifications
- Like posts and comments

### **Admin**
- All author permissions
- User management
- Content moderation
- Post approval/rejection
- Comment moderation
- Role assignment
- View all analytics
- System settings

---

## 🚀 Recent Updates (December 2024)

### ✅ **Latest Features (Just Added!)**

1. **Complete Notification System**
   - ✅ Real-time notification bell with badge
   - ✅ Dropdown notification view
   - ✅ Mobile-responsive notifications
   - ✅ Notification dashboard page
   - ✅ Mark as read/unread functionality
   - ✅ Delete notifications
   - ✅ Auto-refresh every 30 seconds
   - ✅ Notification types: likes, comments, replies, follows, approvals
   - ✅ Filter by read/unread
   - ✅ Pagination support
   - ✅ User notification preferences

2. **Complete Comment System**
   - ✅ Multi-level threaded comments
   - ✅ Guest comments support
   - ✅ Comment replies
   - ✅ Like comments
   - ✅ Comment moderation
   - ✅ Edit and delete
   - ✅ Admin auto-approval

3. **Mobile Enhancements**
   - ✅ Mobile notification bell
   - ✅ Responsive notification dropdown
   - ✅ Mobile-optimized dashboard
   - ✅ Touch-friendly interactions
   - ✅ Improved mobile navigation

4. **Follow Notifications**
   - ✅ Notifications when someone follows you
   - ✅ Integrated with notification system
   - ✅ Configurable in user settings

### ✅ **Completed (December 2024)**

1. **Profile System Enhancements**
   - ✅ Unique username system with real-time validation
   - ✅ Public profile pages (`/profile/[username]`)
   - ✅ Profile picture with advanced cropper (zoom, rotate, move)
   - ✅ Automatic navbar profile picture updates
   - ✅ Profile preview in settings

2. **Follow System**
   - ✅ Follow/Unfollow functionality
   - ✅ Follower & following counts
   - ✅ Real-time statistics updates
   - ✅ Follow status indicators

3. **Author Pages**
   - ✅ Dedicated author pages (`/author/[username]`)
   - ✅ All posts by author
   - ✅ Author bio and stats
   - ✅ SEO-optimized URLs

4. **Statistics & Analytics**
   - ✅ User statistics (posts, views, likes, followers)
   - ✅ Post statistics (views, likes, comments)
   - ✅ Dashboard metrics
   - ✅ Real-time stat updates

5. **Social Sharing**
   - ✅ Share profile button
   - ✅ Open Graph meta tags
   - ✅ Twitter Card integration
   - ✅ Copy link functionality
   - ✅ Native share API support

6. **Image System**
   - ✅ Professional image cropper
   - ✅ Zoom (1x-3x)
   - ✅ Rotation (0°-360°)
   - ✅ Move/Pan functionality
   - ✅ Round/Square crop shapes
   - ✅ Cloudinary integration
   - ✅ URL-based image support

7. **SEO Improvements**
   - ✅ Username-based URLs
   - ✅ Canonical URLs
   - ✅ Meta descriptions
   - ✅ Open Graph tags
   - ✅ Twitter Cards
   - ✅ Structured data

---

## 📋 Future Roadmap

### 🎯 **Phase 1: Enhanced Features** (In Progress)
- [x] Comment system
- [x] Notification system
- [x] Follow notifications
- [ ] Email notifications
- [ ] Push notifications
- [ ] Notification preferences UI

### 🎯 **Phase 2: Enhanced Discovery**
- [ ] Advanced search (full-text search)
- [ ] Tag system
- [ ] Related posts
- [ ] Trending posts
- [ ] Popular authors
- [ ] Recommended content
- [ ] Search filters

### 🎯 **Phase 3: Content Enhancements**
- [ ] Series/Collections
- [ ] Bookmarks/Save for later
- [ ] Reading lists
- [ ] Post scheduling
- [ ] Content calendar
- [ ] Revision history
- [ ] Co-author support
- [ ] Post templates

### 🎯 **Phase 4: Advanced Features**
- [ ] Newsletter integration
- [ ] RSS feeds
- [ ] Webhook support
- [ ] API for third-party apps
- [ ] Analytics dashboard
- [ ] A/B testing
- [ ] Content recommendations
- [ ] ML-powered suggestions

### 🎯 **Phase 5: Monetization** (Optional)
- [ ] Paid memberships
- [ ] Premium content
- [ ] Donation system
- [ ] Ad integration
- [ ] Sponsor support
- [ ] Affiliate links

---

## 🔧 Configuration

### Cloudinary Setup
1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get Cloud Name, API Key, API Secret
3. Create upload preset:
   - Go to Settings → Upload
   - Click "Add upload preset"
   - Name: `multigyan_uploads`
   - Signing Mode: **Unsigned**
   - Save

### MongoDB Setup
1. Create MongoDB Atlas account
2. Create a cluster
3. Get connection string
4. Whitelist your IP
5. Create database user
6. Add connection string to `.env.local`

### NextAuth Setup
1. Generate secret: `openssl rand -base64 32`
2. Add to `.env.local` as `NEXTAUTH_SECRET`
3. Configure OAuth providers (optional)

---

## 🧪 Testing

### Manual Testing Checklist
- [x] User registration
- [x] User login
- [x] Profile update
- [x] Username validation
- [x] Image upload & cropping
- [x] Post creation
- [x] Comment posting
- [x] Comment replies
- [x] Like posts/comments
- [x] Follow/Unfollow
- [x] Notifications (all types)
- [x] Mark notifications as read
- [x] Social sharing
- [x] Public profile view
- [x] Author page view
- [x] Admin functions

### Testing Commands
```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Lint code
npm run lint
```

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `POST /api/auth/signup` - Register (if enabled)

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/check-username` - Check username availability
- `GET /api/users/[userId]/follow` - Get follow status
- `POST /api/users/[userId]/follow` - Follow/Unfollow user
- `GET /api/users/[userId]/posts` - Get user posts

### Posts
- `GET /api/posts` - Get all posts
- `GET /api/posts/[id]` - Get specific post
- `POST /api/posts` - Create post (protected)
- `PUT /api/posts/[id]` - Update post (protected)
- `DELETE /api/posts/[id]` - Delete post (protected)
- `POST /api/posts/[id]/actions` - Post actions (like, approve, etc.)

### Comments (NEW!)
- `GET /api/comments?postId=[id]` - Get comments for a post
- `POST /api/comments` - Add a comment
- `PUT /api/comments` - Update comment (like, approve, edit)
- `DELETE /api/comments?postId=[id]&commentId=[id]` - Delete comment

### Notifications (NEW!)
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications` - Mark as read
- `DELETE /api/notifications?id=[id]` - Delete notification

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines
- Follow existing code style
- Use JavaScript (not TypeScript)
- Write clear commit messages
- Add comments for complex logic
- Test your changes
- Update documentation

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Developer

**Vishal Kumar Sharma** (@master)
- Email: vishal@multigyan.in
- Twitter: [@VishalSharma37](https://x.com/VishalSharma37)
- LinkedIn: [Vishal Kumar Sharma](https://linkedin.com/in/mastervishal)

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- MongoDB for database solution
- Cloudinary for image management
- All contributors and supporters

---

## 📞 Support

- **Documentation**: Coming soon
- **Issues**: [GitHub Issues](https://github.com/yourusername/multigyan/issues)
- **Email**: support@multigyan.in
- **Twitter**: [@multigyan](https://twitter.com/multigyan)

---

## 🔥 Quick Start Guide

1. **Clone & Install**
   ```bash
   git clone https://github.com/yourusername/multigyan.git
   cd multigyan
   npm install
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env.local`
   - Fill in your credentials

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Create First Admin**
   - Register with email from `INITIAL_ADMIN_EMAILS`
   - Login and access admin panel

5. **Start Creating Content!**

---

## 📊 Project Stats

- **Version**: 1.0.0
- **Last Updated**: December 2024
- **Status**: Active Development
- **Language**: 100% JavaScript
- **License**: MIT
- **Dependencies**: 30+ packages
- **Features**: 50+ implemented

---

## 🎨 Design Philosophy

- **Mobile-First**: Designed for mobile, enhanced for desktop
- **Performance**: Fast loading with optimized images and code splitting
- **Accessibility**: WCAG compliant with semantic HTML
- **SEO-Friendly**: Optimized for search engines
- **User-Centric**: Intuitive interface with smooth UX
- **Scalable**: Built to handle growth

---

## 🛡️ Security

- Secure authentication with NextAuth
- Password hashing with bcryptjs
- CSRF protection
- XSS prevention
- SQL injection protection (MongoDB)
- Rate limiting (coming soon)
- Input validation
- Secure session management

---

## 📈 Performance

- Server-side rendering (SSR)
- Static generation for pages
- Image optimization
- Code splitting
- Lazy loading
- CDN integration (Cloudinary)
- Database indexing
- Caching strategies

---

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

**Built with ❤️ using Next.js and MongoDB**

---

*For more information, visit our [documentation](https://docs.multigyan.in) (coming soon)*
