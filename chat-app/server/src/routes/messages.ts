import express from 'express';
import { prisma } from '../index';
import { requireAuth } from '../config/auth';

const router = express.Router();

router.use(requireAuth);

// Get messages for a conversation or channel
router.get('/', async (req, res) => {
  try {
    const user = req.user as any;
    const { conversationId, channelId, limit = 50, before } = req.query;

    if (!conversationId) {
      return res.status(400).json({ error: 'conversationId required' });
    }

    // Verify user is member of conversation
    const member = await prisma.conversationMember.findFirst({
      where: {
        conversationId: conversationId as string,
        userId: user.id,
      },
    });

    if (!member) {
      return res.status(403).json({ error: 'Not a member of this conversation' });
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId as string,
        ...(channelId && { channelId: channelId as string }),
        ...(before && { createdAt: { lt: new Date(before as string) } }),
      },
      include: {
        sender: {
          select: {
            id: true,
            displayName: true,
            photoURL: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
    });

    res.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/', async (req, res) => {
  try {
    const user = req.user as any;
    const { conversationId, channelId, content, type, fileUrl, fileName, fileSize } = req.body;

    if (!conversationId || !content) {
      return res.status(400).json({ error: 'conversationId and content required' });
    }

    // Verify user is member
    const member = await prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId: user.id,
      },
    });

    if (!member) {
      return res.status(403).json({ error: 'Not a member of this conversation' });
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        channelId,
        senderId: user.id,
        content,
        type: type || 'text',
        fileUrl,
        fileName,
        fileSize,
      },
      include: {
        sender: {
          select: {
            id: true,
            displayName: true,
            photoURL: true,
          },
        },
        reactions: true,
      },
    });

    // Update conversation lastMessageAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    res.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Edit a message
router.patch('/:id', async (req, res) => {
  try {
    const user = req.user as any;
    const { id } = req.params;
    const { content } = req.body;

    const message = await prisma.message.findFirst({
      where: {
        id,
        senderId: user.id,
      },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found or unauthorized' });
    }

    const updated = await prisma.message.update({
      where: { id },
      data: {
        content,
        isEdited: true,
        updatedAt: new Date(),
      },
      include: {
        sender: {
          select: {
            id: true,
            displayName: true,
            photoURL: true,
          },
        },
        reactions: true,
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to edit message' });
  }
});

// Delete a message
router.delete('/:id', async (req, res) => {
  try {
    const user = req.user as any;
    const { id } = req.params;

    const message = await prisma.message.findFirst({
      where: {
        id,
        senderId: user.id,
      },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found or unauthorized' });
    }

    await prisma.message.delete({
      where: { id },
    });

    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Add reaction to message
router.post('/:id/reactions', async (req, res) => {
  try {
    const user = req.user as any;
    const { id } = req.params;
    const { emoji } = req.body;

    // Check if reaction already exists
    const existing = await prisma.messageReaction.findFirst({
      where: {
        messageId: id,
        userId: user.id,
        emoji,
      },
    });

    if (existing) {
      // Remove reaction
      await prisma.messageReaction.delete({
        where: { id: existing.id },
      });
      return res.json({ action: 'removed' });
    }

    // Add reaction
    const reaction = await prisma.messageReaction.create({
      data: {
        messageId: id,
        userId: user.id,
        emoji,
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    res.json({ action: 'added', reaction });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});

export default router;
