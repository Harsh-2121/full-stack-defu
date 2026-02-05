import express from 'express';
import { prisma } from '../index';
import { requireAuth } from '../config/auth';

const router = express.Router();

router.use(requireAuth);

// Get all conversations for current user
router.get('/', async (req, res) => {
  try {
    const user = req.user as any;
    
    const conversations = await prisma.conversation.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                photoURL: true,
                status: true,
                email: true,
              },
            },
          },
        },
        channels: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                displayName: true,
                photoURL: true,
              },
            },
          },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Create a new conversation
router.post('/', async (req, res) => {
  try {
    const user = req.user as any;
    const { type, name, description, memberIds } = req.body;

    if (!['dm', 'group', 'public'].includes(type)) {
      return res.status(400).json({ error: 'Invalid conversation type' });
    }

    // For public servers, we need approval - handled separately
    if (type === 'public') {
      return res.status(400).json({ error: 'Use permission request endpoint for public servers' });
    }

    const conversation = await prisma.conversation.create({
      data: {
        type,
        name,
        description,
        creatorId: user.id,
        isApproved: type !== 'public',
        members: {
          create: [
            { userId: user.id },
            ...(memberIds || []).map((id: string) => ({ userId: id })),
          ],
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                photoURL: true,
                status: true,
              },
            },
          },
        },
        channels: true,
      },
    });

    res.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Get conversation by ID
router.get('/:id', async (req, res) => {
  try {
    const user = req.user as any;
    const { id } = req.params;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        members: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                photoURL: true,
                status: true,
                email: true,
              },
            },
          },
        },
        channels: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Add members to conversation
router.post('/:id/members', async (req, res) => {
  try {
    const user = req.user as any;
    const { id } = req.params;
    const { memberIds } = req.body;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        creatorId: user.id, // Only creator can add members
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found or unauthorized' });
    }

    await prisma.conversationMember.createMany({
      data: memberIds.map((userId: string) => ({
        conversationId: id,
        userId,
      })),
      skipDuplicates: true,
    });

    const updated = await prisma.conversation.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                photoURL: true,
                status: true,
              },
            },
          },
        },
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add members' });
  }
});

// Create channel in a server
router.post('/:id/channels', async (req, res) => {
  try {
    const user = req.user as any;
    const { id } = req.params;
    const { name, description, type } = req.body;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        type: 'public',
        creatorId: user.id,
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Server not found or unauthorized' });
    }

    const channelCount = await prisma.channel.count({
      where: { serverId: id },
    });

    const channel = await prisma.channel.create({
      data: {
        serverId: id,
        name,
        description,
        type: type || 'text',
        position: channelCount,
      },
    });

    res.json(channel);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create channel' });
  }
});

// Leave conversation
router.delete('/:id/leave', async (req, res) => {
  try {
    const user = req.user as any;
    const { id } = req.params;

    await prisma.conversationMember.deleteMany({
      where: {
        conversationId: id,
        userId: user.id,
      },
    });

    res.json({ message: 'Left conversation' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to leave conversation' });
  }
});

export default router;
