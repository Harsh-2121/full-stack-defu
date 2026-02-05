import { Server as SocketIOServer } from 'socket.io';
import { prisma } from '../index';

interface SocketUser {
  userId: string;
  socketId: string;
}

const connectedUsers = new Map<string, string[]>(); // userId -> socketIds[]
const typingUsers = new Map<string, Set<string>>(); // conversationId -> Set<userId>

export function setupSocketIO(io: SocketIOServer) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('user:connect', async (userId: string) => {
      if (!userId) return;

      // Add socket to user's connections
      const userSockets = connectedUsers.get(userId) || [];
      userSockets.push(socket.id);
      connectedUsers.set(userId, userSockets);

      // Update user status to online
      await prisma.user.update({
        where: { id: userId },
        data: { status: 'online', lastSeen: new Date() },
      });

      // Broadcast status to all users
      io.emit('user:status', {
        userId,
        status: 'online',
        lastSeen: new Date(),
      });

      console.log(`User ${userId} connected with socket ${socket.id}`);
    });

    socket.on('conversation:join', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    socket.on('conversation:leave', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`Socket ${socket.id} left conversation ${conversationId}`);
    });

    socket.on('typing:start', (data: { conversationId: string; userId: string; userName: string }) => {
      const typing = typingUsers.get(data.conversationId) || new Set();
      typing.add(data.userId);
      typingUsers.set(data.conversationId, typing);

      socket.to(`conversation:${data.conversationId}`).emit('typing:start', {
        conversationId: data.conversationId,
        userId: data.userId,
        userName: data.userName,
      });
    });

    socket.on('typing:stop', (data: { conversationId: string; userId: string }) => {
      const typing = typingUsers.get(data.conversationId);
      if (typing) {
        typing.delete(data.userId);
        if (typing.size === 0) {
          typingUsers.delete(data.conversationId);
        }
      }

      socket.to(`conversation:${data.conversationId}`).emit('typing:stop', {
        conversationId: data.conversationId,
        userId: data.userId,
      });
    });

    socket.on('message:new', (message: any) => {
      io.to(`conversation:${message.conversationId}`).emit('message:new', message);
    });

    socket.on('message:edit', (data: { messageId: string; content: string; conversationId: string }) => {
      io.to(`conversation:${data.conversationId}`).emit('message:edit', data);
    });

    socket.on('message:delete', (data: { messageId: string; conversationId: string }) => {
      io.to(`conversation:${data.conversationId}`).emit('message:delete', data);
    });

    socket.on('message:reaction', (data: any) => {
      io.to(`conversation:${data.conversationId}`).emit('message:reaction', data);
    });

    socket.on('disconnect', async () => {
      console.log('Client disconnected:', socket.id);

      // Find and remove user
      for (const [userId, socketIds] of connectedUsers.entries()) {
        const index = socketIds.indexOf(socket.id);
        if (index !== -1) {
          socketIds.splice(index, 1);
          
          if (socketIds.length === 0) {
            // User has no more connections, set to offline
            connectedUsers.delete(userId);
            
            await prisma.user.update({
              where: { id: userId },
              data: { status: 'offline', lastSeen: new Date() },
            });

            io.emit('user:status', {
              userId,
              status: 'offline',
              lastSeen: new Date(),
            });
          } else {
            connectedUsers.set(userId, socketIds);
          }
          break;
        }
      }
    });
  });
}

export function getConnectedUsers(): Map<string, string[]> {
  return connectedUsers;
}
