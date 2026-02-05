import { Express } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import conversationRoutes from './conversations';
import messageRoutes from './messages';
import permissionRoutes from './permissions';
import uploadRoutes from './upload';

export function setupRoutes(app: Express) {
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/conversations', conversationRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/permissions', permissionRoutes);
  app.use('/api/upload', uploadRoutes);
}
