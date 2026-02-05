import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../index';

export function setupAuth() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found in Google profile'));
          }

          let user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                googleId: profile.id,
                displayName: profile.displayName || email.split('@')[0],
                photoURL: profile.photos?.[0]?.value,
                status: 'online',
              },
            });
          } else if (!user.googleId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                googleId: profile.id,
                photoURL: profile.photos?.[0]?.value || user.photoURL,
              },
            });
          }

          // Update status to online
          await prisma.user.update({
            where: { id: user.id },
            data: { status: 'online', lastSeen: new Date() },
          });

          return done(null, user);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}

export function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}
