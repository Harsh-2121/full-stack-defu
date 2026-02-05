import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: Date;
}

interface Message {
  id: string;
  conversationId: string;
  channelId?: string;
  senderId: string;
  content: string;
  type: 'text' | 'file' | 'image';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  createdAt: Date;
  isEdited: boolean;
  sender: {
    id: string;
    displayName: string;
    photoURL?: string;
  };
  reactions: Array<{
    id: string;
    emoji: string;
    userId: string;
    user: {
      id: string;
      displayName: string;
    };
  }>;
}

interface Conversation {
  id: string;
  type: 'dm' | 'group' | 'public';
  name?: string;
  description?: string;
  photoURL?: string;
  creatorId: string;
  isApproved: boolean;
  members: Array<{
    id: string;
    user: User;
  }>;
  channels?: Array<{
    id: string;
    name: string;
    description?: string;
    type: 'text' | 'voice';
    position: number;
  }>;
  messages?: Message[];
  lastMessageAt?: Date;
}

interface AppState {
  user: User | null;
  socket: Socket | null;
  conversations: Conversation[];
  activeConversation: Conversation | null;
  activeChannel: string | null;
  messages: Record<string, Message[]>;
  typingUsers: Record<string, string[]>;
  theme: 'light' | 'dark';
  
  setUser: (user: User | null) => void;
  connectSocket: (userId: string) => void;
  disconnectSocket: () => void;
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (conversation: Conversation | null) => void;
  setActiveChannel: (channelId: string | null) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, content: string) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  addReaction: (conversationId: string, messageId: string, reaction: any) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addTypingUser: (conversationId: string, userName: string) => void;
  removeTypingUser: (conversationId: string, userName: string) => void;
  toggleTheme: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  socket: null,
  conversations: [],
  activeConversation: null,
  activeChannel: null,
  messages: {},
  typingUsers: {},
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'dark',

  setUser: (user) => set({ user }),

  connectSocket: (userId) => {
    const socket = io('http://localhost:3000', {
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      socket.emit('user:connect', userId);
    });

    socket.on('message:new', (message: Message) => {
      const state = get();
      const conversationId = message.conversationId;
      const currentMessages = state.messages[conversationId] || [];
      
      // Play sound
      const audio = new Audio('/sounds/message.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});

      set({
        messages: {
          ...state.messages,
          [conversationId]: [...currentMessages, message],
        },
      });
    });

    socket.on('typing:start', ({ conversationId, userName }) => {
      const state = get();
      const current = state.typingUsers[conversationId] || [];
      if (!current.includes(userName)) {
        set({
          typingUsers: {
            ...state.typingUsers,
            [conversationId]: [...current, userName],
          },
        });
      }
    });

    socket.on('typing:stop', ({ conversationId, userName }) => {
      const state = get();
      const current = state.typingUsers[conversationId] || [];
      set({
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: current.filter(name => name !== userName),
        },
      });
    });

    socket.on('user:status', ({ userId: changedUserId, status }) => {
      const state = get();
      const updatedConversations = state.conversations.map(conv => ({
        ...conv,
        members: conv.members.map(member =>
          member.user.id === changedUserId
            ? { ...member, user: { ...member.user, status } }
            : member
        ),
      }));
      set({ conversations: updatedConversations });
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  setConversations: (conversations) => set({ conversations }),

  setActiveConversation: (conversation) => set({ activeConversation: conversation, activeChannel: null }),

  setActiveChannel: (channelId) => set({ activeChannel: channelId }),

  addMessage: (conversationId, message) => {
    const state = get();
    const currentMessages = state.messages[conversationId] || [];
    set({
      messages: {
        ...state.messages,
        [conversationId]: [...currentMessages, message],
      },
    });
  },

  updateMessage: (conversationId, messageId, content) => {
    const state = get();
    const messages = state.messages[conversationId] || [];
    set({
      messages: {
        ...state.messages,
        [conversationId]: messages.map(msg =>
          msg.id === messageId ? { ...msg, content, isEdited: true } : msg
        ),
      },
    });
  },

  deleteMessage: (conversationId, messageId) => {
    const state = get();
    const messages = state.messages[conversationId] || [];
    set({
      messages: {
        ...state.messages,
        [conversationId]: messages.filter(msg => msg.id !== messageId),
      },
    });
  },

  addReaction: (conversationId, messageId, reaction) => {
    const state = get();
    const messages = state.messages[conversationId] || [];
    set({
      messages: {
        ...state.messages,
        [conversationId]: messages.map(msg =>
          msg.id === messageId
            ? { ...msg, reactions: [...msg.reactions, reaction] }
            : msg
        ),
      },
    });
  },

  setMessages: (conversationId, messages) => {
    const state = get();
    set({
      messages: {
        ...state.messages,
        [conversationId]: messages,
      },
    });
  },

  addTypingUser: (conversationId, userName) => {
    const state = get();
    const current = state.typingUsers[conversationId] || [];
    if (!current.includes(userName)) {
      set({
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: [...current, userName],
        },
      });
    }
  },

  removeTypingUser: (conversationId, userName) => {
    const state = get();
    const current = state.typingUsers[conversationId] || [];
    set({
      typingUsers: {
        ...state.typingUsers,
        [conversationId]: current.filter(name => name !== userName),
      },
    });
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark');
    set({ theme: newTheme });
  },
}));
