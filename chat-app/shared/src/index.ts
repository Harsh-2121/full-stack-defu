export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: Date;
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'file' | 'image';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
  reactions: MessageReaction[];
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  type: 'dm' | 'group' | 'public';
  name?: string;
  description?: string;
  photoURL?: string;
  creatorId: string;
  memberIds: string[];
  channelIds?: string[]; // For public servers
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
  isApproved?: boolean; // For public servers
}

export interface Channel {
  id: string;
  serverId: string;
  name: string;
  description?: string;
  type: 'text' | 'voice';
  position: number;
  createdAt: Date;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

export interface ServerPermissionRequest {
  id: string;
  userId: string;
  userEmail: string;
  serverName: string;
  serverDescription: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  adminEmail: string;
}

export interface OnlineStatus {
  userId: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: Date;
}

export type SocketEvent =
  | 'user:connect'
  | 'user:disconnect'
  | 'user:status'
  | 'message:new'
  | 'message:edit'
  | 'message:delete'
  | 'message:reaction'
  | 'typing:start'
  | 'typing:stop'
  | 'conversation:join'
  | 'conversation:leave'
  | 'conversation:update';

export interface SocketPayload<T = any> {
  event: SocketEvent;
  data: T;
  timestamp: Date;
}
