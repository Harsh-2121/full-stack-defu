# Chat App - Production-Ready Team Communication Platform

A full-featured, production-ready chat application with real-time messaging, file sharing, voice channels, and comprehensive team collaboration features.

## 🚀 Features

### Core Functionality
- ✅ **Real-time Messaging** - Instant message delivery with Socket.IO
- ✅ **Direct Messages (DMs)** - Private 1-on-1 conversations
- ✅ **Group DMs** - Multi-user private group chats
- ✅ **Public Servers** - Discord-style servers with multiple channels
- ✅ **Channel System** - Text and voice channels within servers
- ✅ **File Sharing** - Unlimited file, folder, and image uploads (100MB per file)
- ✅ **Emoji Reactions** - React to messages with emojis
- ✅ **Typing Indicators** - See when others are typing
- ✅ **Online Status** - Real-time presence (online/offline/away)
- ✅ **Message Editing** - Edit your sent messages
- ✅ **Message Deletion** - Delete your own messages

### Authentication & Security
- ✅ **Google OAuth 2.0** - Secure authentication
- ✅ **Session Management** - Persistent login sessions
- ✅ **Permission System** - Admin approval for public server creation
- ✅ **Email Notifications** - Permission request notifications
- ✅ **Rate Limiting** - API protection
- ✅ **Security Headers** - Helmet.js protection

### UI/UX
- ✅ **Dark/Light Theme** - Toggle between themes
- ✅ **Responsive Design** - Works on web and mobile
- ✅ **SPA Architecture** - Smooth single-page application
- ✅ **Animations & Effects** - Polished micro-interactions
- ✅ **Sound Effects** - Notification sounds
- ✅ **Modern Design** - Blue and orange color scheme
- ✅ **Custom Scrollbars** - Styled scrolling experience

### Technical Features
- ✅ **Production-Ready** - Scalable architecture for 400+ users
- ✅ **PostgreSQL Database** - Robust data storage with Prisma ORM
- ✅ **Real-time Updates** - Socket.IO for instant synchronization
- ✅ **File Upload System** - Multer with Sharp image processing
- ✅ **TypeScript** - Full type safety
- ✅ **API Documentation** - RESTful API design

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** package manager
- **Git** - [Download](https://git-scm.com/)

## 🛠️ Installation & Setup

### Step 1: Clone or Extract the Project

If you received this as a zip file, extract it. Otherwise:

```bash
cd your-desired-directory
# The chat-app folder should be here
```

### Step 2: Install Dependencies

Install all dependencies for the monorepo:

```bash
cd chat-app
npm run setup
```

This will install dependencies for:
- Root workspace
- Client (React/Vite)
- Server (Express/Node.js)
- Shared types package

### Step 3: Set Up PostgreSQL Database

1. **Create a PostgreSQL database:**

```sql
CREATE DATABASE chatapp;
CREATE USER chatapp_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE chatapp TO chatapp_user;
```

2. **Note your database connection string:**
```
postgresql://chatapp_user:your_secure_password@localhost:5432/chatapp
```

### Step 4: Configure Environment Variables

#### Server Configuration

1. Copy the example environment file:
```bash
cd server
cp .env.example .env
```

2. Edit `.env` with your actual values:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
SERVER_URL=http://localhost:3000

# Client URL
CLIENT_URL=http://localhost:5173

# Database - REPLACE WITH YOUR ACTUAL DATABASE URL
DATABASE_URL="postgresql://chatapp_user:your_secure_password@localhost:5432/chatapp?schema=public"

# Session Secret - CHANGE THIS TO A RANDOM STRING
SESSION_SECRET=generate-a-random-secret-key-here-use-at-least-32-characters

# Google OAuth - GET THESE FROM GOOGLE CLOUD CONSOLE
GOOGLE_CLIENT_ID=your-google-client-id-from-google-cloud-console
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Email Configuration (for permission requests)
# Option 1: Gmail (recommended for testing)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password

# Option 2: Other SMTP providers (SendGrid, Mailgun, etc.)
# SMTP_HOST=smtp.sendgrid.net
# SMTP_PORT=587
# SMTP_USER=apikey
# SMTP_PASS=your-sendgrid-api-key
```

### Step 5: Set Up Google OAuth

To enable Google Sign-In:

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**

2. **Create a new project** or select an existing one

3. **Enable Google+ API:**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth 2.0 credentials:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - Your production domain (when deploying)
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback`
     - Your production callback URL (when deploying)

5. **Copy the Client ID and Client Secret** to your `.env` file

### Step 6: Set Up Gmail for Email Notifications

1. **Enable 2-Factor Authentication** on your Gmail account

2. **Create an App Password:**
   - Go to your [Google Account settings](https://myaccount.google.com/)
   - Security > 2-Step Verification > App passwords
   - Generate a new app password
   - Copy it to your `.env` file as `SMTP_PASS`

### Step 7: Initialize the Database

Run Prisma migrations to set up your database schema:

```bash
cd server
npm run prisma:generate
npm run prisma:migrate
```

This will:
- Generate Prisma Client
- Create all database tables
- Set up relationships and indexes

### Step 8: Start the Application

You have two options:

#### Option A: Run Everything Together (Recommended for Development)

From the root `chat-app` directory:

```bash
npm run dev
```

This starts:
- Server on `http://localhost:3000`
- Client on `http://localhost:5173`

#### Option B: Run Separately

**Terminal 1 - Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Client:**
```bash
cd client
npm run dev
```

### Step 9: Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

Click "Sign in with Google" to authenticate!

## 🏗️ Project Structure

```
chat-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand state management
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   └── assets/        # Static assets (images, sounds)
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── server/                # Express backend
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── socket/       # Socket.IO handlers
│   │   └── index.ts      # Server entry point
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   ├── uploads/          # File upload directory
│   ├── package.json
│   └── .env              # Environment variables
│
├── shared/               # Shared TypeScript types
│   └── src/
│       └── index.ts     # Type definitions
│
└── package.json         # Root workspace config
```

## 📱 Usage Guide

### Creating Conversations

**Direct Messages:**
1. Click the "+" button in the sidebar
2. Select "Direct Message"
3. Search for and select a user
4. Start chatting!

**Group DMs:**
1. Click the "+" button
2. Select "Group DM"
3. Give it a name
4. Add multiple members
5. Create the group

**Public Servers:**
1. Click the "+" button
2. Select "Public Server"
3. Fill in server details
4. Provide an admin email for approval
5. Wait for admin approval via email
6. Once approved, invite members and create channels

### Sending Messages

- **Text:** Type and press Enter
- **Files:** Click the paperclip icon or drag & drop
- **Emojis:** Click the emoji icon
- **Edit:** Hover over your message and click edit
- **Delete:** Hover over your message and click delete
- **React:** Hover over any message and click the reaction button

### Managing Servers

Server creators can:
- Create text and voice channels
- Add/remove members
- Set channel descriptions
- Organize channel order

## 🚀 Production Deployment

### Environment Setup

1. **Set production environment variables:**

```env
NODE_ENV=production
SERVER_URL=https://your-domain.com
CLIENT_URL=https://your-domain.com
DATABASE_URL=your-production-database-url
SESSION_SECRET=very-long-random-production-secret
```

2. **Update Google OAuth:**
   - Add production URLs to authorized origins
   - Add production callback URL

### Database Setup

1. **Create production database** (PostgreSQL on your hosting provider)
2. **Run migrations:**
```bash
cd server
npm run prisma:migrate
```

### Build Process

```bash
# From root directory
npm run build
```

This builds:
- Client (static files in `client/dist`)
- Server (compiled JS in `server/dist`)
- Shared types

### Hosting Recommendations

**Backend:**
- Railway.app (Easy deployment)
- Heroku
- DigitalOcean App Platform
- AWS Elastic Beanstalk
- Render.com

**Database:**
- Railway.app (PostgreSQL)
- Supabase
- Heroku Postgres
- AWS RDS

**Frontend:**
- Vercel
- Netlify
- Cloudflare Pages

**File Storage (for production):**
- AWS S3
- Cloudinary
- DigitalOcean Spaces

### Performance Optimization

For 400 users with 10 active servers:

1. **Database:**
   - Use connection pooling
   - Add indexes (already configured in Prisma schema)
   - Regular backups

2. **Server:**
   - Use PM2 for process management
   - Enable compression (already configured)
   - Set up rate limiting (already configured)

3. **File Storage:**
   - Move from local storage to S3/CDN
   - Implement image compression
   - Set up file size limits

4. **Monitoring:**
   - Set up error tracking (Sentry)
   - Monitor performance (New Relic, Datadog)
   - Set up uptime monitoring

## 🔧 Troubleshooting

### Common Issues

**1. Database Connection Error**
```
Error: Can't reach database server
```
Solution: Verify PostgreSQL is running and DATABASE_URL is correct.

**2. Google OAuth Error**
```
Error: redirect_uri_mismatch
```
Solution: Ensure callback URL in Google Cloud Console matches your .env file.

**3. Socket.IO Connection Failed**
```
WebSocket connection failed
```
Solution: Check CORS settings and ensure client can reach server.

**4. File Upload Error**
```
ENOENT: no such file or directory
```
Solution: Ensure uploads directory exists in server folder.

**5. Email Not Sending**
```
Error sending email
```
Solution: Verify SMTP credentials and app password.

### Development Tips

- Use `npm run prisma:studio` to view database in browser
- Check browser console for client errors
- Check server terminal for backend errors
- Use React DevTools for debugging components

## 📚 API Documentation

### Authentication Endpoints

- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/current` - Get current user
- `POST /api/auth/logout` - Logout user

### User Endpoints

- `GET /api/users` - Get all users
- `GET /api/users/search?q=query` - Search users
- `PATCH /api/users/status` - Update user status

### Conversation Endpoints

- `GET /api/conversations` - Get user's conversations
- `GET /api/conversations/:id` - Get conversation details
- `POST /api/conversations` - Create conversation
- `POST /api/conversations/:id/members` - Add members
- `POST /api/conversations/:id/channels` - Create channel
- `DELETE /api/conversations/:id/leave` - Leave conversation

### Message Endpoints

- `GET /api/messages?conversationId=x` - Get messages
- `POST /api/messages` - Send message
- `PATCH /api/messages/:id` - Edit message
- `DELETE /api/messages/:id` - Delete message
- `POST /api/messages/:id/reactions` - Add reaction

### Permission Endpoints

- `POST /api/permissions/request` - Request server creation
- `GET /api/permissions/my-requests` - Get user's requests
- `GET /api/permissions/:id/approve` - Approve request (admin)
- `GET /api/permissions/:id/reject` - Reject request (admin)

### Upload Endpoints

- `POST /api/upload/file` - Upload single file
- `POST /api/upload/files` - Upload multiple files

## 🎨 Customization

### Changing Colors

Edit `client/tailwind.config.js`:

```javascript
colors: {
  primary: {
    DEFAULT: '#your-blue-color',
  },
  secondary: {
    DEFAULT: '#your-orange-color',
  },
}
```

### Adding Sound Effects

1. Place sound files in `client/public/sounds/`
2. Reference in code: `new Audio('/sounds/your-sound.mp3')`

### Modifying Animations

Edit `client/src/index.css` to adjust animations.

## 🤝 Support

For issues or questions:
1. Check this README
2. Review error logs
3. Verify environment variables
4. Check database connection
5. Ensure all dependencies are installed

## 📄 License

This project is provided as-is for your team's use.

## 🎯 Roadmap

Potential future enhancements:
- Video calling
- Screen sharing
- Message threads
- Advanced search
- Pinned messages
- User roles & permissions
- Custom emojis
- Message read receipts
- User profiles
- Server templates

---

Built with ❤️ for seamless team communication
