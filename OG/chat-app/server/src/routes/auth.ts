import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(process.env.CLIENT_URL || 'http://localhost:5173');
  }
);

router.get('/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

router.post('/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out successfully' });
  });
});

export default router;
