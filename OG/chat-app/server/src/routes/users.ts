import express from 'express';
import { prisma } from '../index';
import { requireAuth } from '../config/auth';

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        photoURL: true,
        status: true,
        lastSeen: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { displayName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        photoURL: true,
        status: true,
      },
      take: 10,
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

router.patch('/status', async (req, res) => {
  try {
    const user = req.user as any;
    const { status } = req.body;

    if (!['online', 'offline', 'away'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { status, lastSeen: new Date() },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

export default router;
