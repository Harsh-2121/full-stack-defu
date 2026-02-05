# 🚀 Production Deployment Guide

## Architecture for 400 Users + 10 Active Servers

### Recommended Stack

**Backend:**
- Railway.app or Render.com (easiest)
- OR AWS EC2 t3.medium (more control)

**Database:**
- Railway PostgreSQL (included)
- OR AWS RDS PostgreSQL db.t3.small

**File Storage:**
- AWS S3 (recommended for scale)
- OR Cloudinary (easier setup)

**Frontend:**
- Vercel or Netlify (free tier works)

### Scaling Considerations

For 400 concurrent users:
- **Server:** 2 CPU, 4GB RAM minimum
- **Database:** 2 CPU, 4GB RAM, 50GB storage
- **WebSocket connections:** Socket.IO cluster mode
- **File storage:** 100GB minimum

## Quick Deploy to Railway

### 1. Prepare Code

```bash
# In server/.env, set for production:
NODE_ENV=production
DATABASE_URL=${{Railway.POSTGRES_URL}}
SESSION_SECRET=your-very-long-random-secret
```

### 2. Deploy Backend

1. Sign up at railway.app
2. New Project → Deploy from GitHub
3. Add PostgreSQL database
4. Add environment variables:
   - All from your .env file
   - Use Railway's DATABASE_URL variable
5. Deploy!

### 3. Run Migrations

In Railway dashboard:
```bash
npx prisma migrate deploy
```

### 4. Deploy Frontend

```bash
# Build locally first
cd client
npm run build

# Deploy to Vercel
vercel --prod

# Add environment variable in Vercel:
VITE_API_URL=https://your-railway-backend.up.railway.app
```

### 5. Update OAuth

In Google Cloud Console:
- Add production URLs to authorized origins
- Add production callback URL

## Alternative: AWS Deployment

### Backend (EC2 + RDS)

```bash
# On EC2 instance
sudo apt update
sudo apt install nodejs npm postgresql-client
git clone your-repo
cd chat-app/server
npm install
npm run build
npm install -g pm2
pm2 start dist/index.js --name chat-server
pm2 startup
pm2 save
```

### File Storage (S3)

1. Create S3 bucket
2. Update server code to use AWS SDK:

```typescript
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

// In upload route:
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'your-bucket-name',
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  })
});
```

## Performance Optimization

### Database Indexing

Already configured in Prisma schema:
- User email, googleId
- Conversation type, creator
- Message conversation, channel, sender
- All foreign keys

### Caching (Optional)

Add Redis for session storage:

```typescript
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL
});

app.use(session({
  store: new RedisStore({ client: redisClient }),
  // ... other options
}));
```

### Load Balancing

For 400+ users, use multiple server instances:

```typescript
// Socket.IO with Redis adapter
import { createAdapter } from '@socket.io/redis-adapter';

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

## Monitoring

### Recommended Tools

1. **Uptime:** UptimeRobot (free)
2. **Errors:** Sentry (free tier)
3. **Performance:** New Relic or Datadog
4. **Logs:** Papertrail or Logtail

### Health Checks

Already implemented at `/health`:

```typescript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});
```

## Backup Strategy

### Database Backups

Railway: Automatic daily backups
AWS RDS: Enable automated backups

Manual backup:
```bash
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### File Backups

If using S3: Enable versioning
If using local storage: Daily rsync to backup server

## Cost Estimation

For 400 users, 10 active servers:

**Option 1: Railway + Vercel**
- Backend: $20/month
- Database: $10/month
- Frontend: Free
- **Total: ~$30/month**

**Option 2: AWS**
- EC2 t3.medium: $30/month
- RDS db.t3.small: $25/month
- S3 + CloudFront: $10/month
- **Total: ~$65/month**

## Security Checklist

- [ ] Strong SESSION_SECRET set
- [ ] DATABASE_URL not exposed
- [ ] HTTPS enabled (automatic with Railway/Vercel)
- [ ] Rate limiting configured (already in code)
- [ ] Helmet.js enabled (already in code)
- [ ] Google OAuth with production URLs
- [ ] File upload limits configured
- [ ] CORS restricted to your domain
- [ ] Environment variables secured
- [ ] Database backups enabled

## Launch Checklist

- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Google OAuth configured
- [ ] Email service tested
- [ ] Health check responding
- [ ] Frontend connects to backend
- [ ] File uploads working
- [ ] Real-time messaging working
- [ ] Monitoring enabled
- [ ] Backups configured

## Support

After deployment, monitor:
- Error rates (should be < 0.1%)
- Response times (should be < 200ms)
- WebSocket connections (stable)
- Database queries (< 100ms average)
- File upload success rate (> 99%)

