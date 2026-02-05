import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export const authApi = {
  getCurrentUser: () => api.get('/auth/current'),
  logout: () => api.post('/auth/logout'),
};

export const userApi = {
  getUsers: () => api.get('/users'),
  searchUsers: (query: string) => api.get(`/users/search?q=${query}`),
  updateStatus: (status: string) => api.patch('/users/status', { status }),
};

export const conversationApi = {
  getConversations: () => api.get('/conversations'),
  getConversation: (id: string) => api.get(`/conversations/${id}`),
  createConversation: (data: any) => api.post('/conversations', data),
  addMembers: (id: string, memberIds: string[]) => 
    api.post(`/conversations/${id}/members`, { memberIds }),
  createChannel: (serverId: string, data: any) =>
    api.post(`/conversations/${serverId}/channels`, data),
  leaveConversation: (id: string) => api.delete(`/conversations/${id}/leave`),
};

export const messageApi = {
  getMessages: (conversationId: string, channelId?: string, before?: string) => 
    api.get('/messages', { params: { conversationId, channelId, before } }),
  sendMessage: (data: any) => api.post('/messages', data),
  editMessage: (id: string, content: string) => api.patch(`/messages/${id}`, { content }),
  deleteMessage: (id: string) => api.delete(`/messages/${id}`),
  addReaction: (id: string, emoji: string) => 
    api.post(`/messages/${id}/reactions`, { emoji }),
};

export const permissionApi = {
  requestPermission: (data: any) => api.post('/permissions/request', data),
  getMyRequests: () => api.get('/permissions/my-requests'),
};

export const uploadApi = {
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadFiles: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return api.post('/upload/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;
