import express from 'express';
import { prisma } from '../index';
import { requireAuth } from '../config/auth';
import { sendPermissionRequest, sendPermissionResponse } from '../services/email';

const router = express.Router();

router.use(requireAuth);

// Request permission to create a public server
router.post('/request', async (req, res) => {
  try {
    const user = req.user as any;
    const { serverName, serverDescription, adminEmail } = req.body;

    if (!serverName || !serverDescription || !adminEmail) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const request = await prisma.serverPermissionRequest.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        serverName,
        serverDescription,
        adminEmail,
        status: 'pending',
      },
    });

    // Send email to admin
    try {
      await sendPermissionRequest(adminEmail, {
        id: request.id,
        userEmail: user.email,
        serverName,
        serverDescription,
      });
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Continue anyway - request is saved
    }

    res.json(request);
  } catch (error) {
    console.error('Error creating permission request:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// Get user's permission requests
router.get('/my-requests', async (req, res) => {
  try {
    const user = req.user as any;

    const requests = await prisma.serverPermissionRequest.findMany({
      where: { userId: user.id },
      orderBy: { requestedAt: 'desc' },
    });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Approve a permission request (admin only - via email link)
router.get('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;

    const request = await prisma.serverPermissionRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return res.status(404).send('<h1>Request not found</h1>');
    }

    if (request.status !== 'pending') {
      return res.send(`<h1>This request has already been ${request.status}</h1>`);
    }

    // Create the server/conversation
    const conversation = await prisma.conversation.create({
      data: {
        type: 'public',
        name: request.serverName,
        description: request.serverDescription,
        creatorId: request.userId,
        isApproved: true,
        members: {
          create: [{ userId: request.userId }],
        },
        channels: {
          create: [
            { name: 'general', type: 'text', position: 0 },
            { name: 'announcements', type: 'text', position: 1 },
          ],
        },
      },
    });

    // Update request
    await prisma.serverPermissionRequest.update({
      where: { id },
      data: {
        status: 'approved',
        conversationId: conversation.id,
        resolvedAt: new Date(),
      },
    });

    // Send response email to user
    try {
      await sendPermissionResponse(request.userEmail, request.serverName, true);
    } catch (emailError) {
      console.error('Failed to send response email:', emailError);
    }

    res.send(`
      <html>
        <head><title>Request Approved</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1 style="color: #10b981;">✓ Request Approved</h1>
          <p>The server "${request.serverName}" has been approved and created.</p>
          <p>The user has been notified via email.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).send('<h1>Error processing request</h1>');
  }
});

// Reject a permission request (admin only - via email link)
router.get('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;

    const request = await prisma.serverPermissionRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return res.status(404).send('<h1>Request not found</h1>');
    }

    if (request.status !== 'pending') {
      return res.send(`<h1>This request has already been ${request.status}</h1>`);
    }

    // Update request
    await prisma.serverPermissionRequest.update({
      where: { id },
      data: {
        status: 'rejected',
        resolvedAt: new Date(),
      },
    });

    // Send response email to user
    try {
      await sendPermissionResponse(request.userEmail, request.serverName, false);
    } catch (emailError) {
      console.error('Failed to send response email:', emailError);
    }

    res.send(`
      <html>
        <head><title>Request Rejected</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1 style="color: #ef4444;">✗ Request Rejected</h1>
          <p>The server creation request for "${request.serverName}" has been rejected.</p>
          <p>The user has been notified via email.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).send('<h1>Error processing request</h1>');
  }
});

export default router;
