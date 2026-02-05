# 🚀 Quick Start Guide

Get your chat app running in 5 minutes!

## Prerequisites
- Node.js 18+
- PostgreSQL 14+

## Steps

### 1. Install Dependencies
```bash
cd chat-app
npm run setup
```

### 2. Set Up Database
```sql
CREATE DATABASE chatapp;
CREATE USER chatapp_user WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE chatapp TO chatapp_user;
```

### 3. Configure Server
```bash
cd server
cp .env.example .env
# Edit .env with your values:
# - DATABASE_URL
# - GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET (from Google Cloud Console)
# - SMTP settings (Gmail recommended)
```

### 4. Initialize Database
```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Start the App
```bash
cd ..
npm run dev
```

### 6. Open Browser
Navigate to: http://localhost:5173

## Google OAuth Setup (2 minutes)

1. Go to https://console.cloud.google.com
2. Create project → Enable Google+ API
3. Create OAuth credentials:
   - Authorized origins: `http://localhost:5173`
   - Redirect URIs: `http://localhost:3000/api/auth/google/callback`
4. Copy Client ID & Secret to `.env`

## Gmail SMTP Setup (1 minute)

1. Enable 2FA on Gmail
2. Create App Password: https://myaccount.google.com/apppasswords
3. Add to `.env`:
   ```
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

## That's It!

Your production-ready chat app is now running! 🎉

For detailed information, see README.md
