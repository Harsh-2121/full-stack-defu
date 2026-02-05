import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store';
import { messageApi, uploadApi } from '../services/api';
import { Send, Paperclip, Smile } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import EmojiPicker from 'emoji-picker-react';

export default function ChatWindow() {
  const {user, activeConversation, messages, socket, setMessages, addMessage, typingUsers} = useAppStore();
  const [input, setInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const conversationKey = activeConversation?.id || '';
  const conversationMessages = messages[conversationKey] || [];

  useEffect(() => {
    if (activeConversation) {
      loadMessages();
      socket?.emit('conversation:join', activeConversation.id);
    }
    return () => {
      if (activeConversation) {
        socket?.emit('conversation:leave', activeConversation.id);
      }
    };
  }, [activeConversation?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  const loadMessages = async () => {
    if (!activeConversation) return;
    try {
      const res = await messageApi.getMessages(activeConversation.id);
      setMessages(activeConversation.id, res.data);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || !activeConversation || !user) return;

    const content = input;
    setInput('');

    try {
      const res = await messageApi.sendMessage({
        conversationId: activeConversation.id,
        content,
        type: 'text',
      });
      socket?.emit('message:new', res.data);
      addMessage(activeConversation.id, res.data);
    } catch (error) {
      toast.error('Failed to send message');
      setInput(content);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConversation) return;

    setUploading(true);
    try {
      const uploadRes = await uploadApi.uploadFile(file);
      const res = await messageApi.sendMessage({
        conversationId: activeConversation.id,
        content: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        fileUrl: uploadRes.data.url,
        fileName: uploadRes.data.filename,
        fileSize: uploadRes.data.size,
      });
      socket?.emit('message:new', res.data);
      addMessage(activeConversation.id, res.data);
      toast.success('File uploaded!');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const typingUsersList = typingUsers[conversationKey] || [];

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {conversationMessages.map((msg, idx) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.02 }}
            className={`mb-4 flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-lg ${msg.senderId === user?.id ? 'bg-primary text-white' : 'bg-light-surface dark:bg-dark-surface'} rounded-2xl px-4 py-2`}>
              <p className="text-sm font-semibold mb-1">{msg.sender.displayName}</p>
              {msg.type === 'image' && msg.fileUrl && (
                <img src={msg.fileUrl} alt={msg.fileName} className="max-w-xs rounded-lg mb-2" />
              )}
              <p>{msg.content}</p>
              {msg.isEdited && <span className="text-xs opacity-70">(edited)</span>}
            </div>
          </motion.div>
        ))}
        {typingUsersList.length > 0 && (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="flex gap-1">
              <span className="typing-dot w-2 h-2 bg-gray-500 rounded-full"></span>
              <span className="typing-dot w-2 h-2 bg-gray-500 rounded-full"></span>
              <span className="typing-dot w-2 h-2 bg-gray-500 rounded-full"></span>
            </div>
            <span className="text-sm">{typingUsersList.join(', ')} typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-light-border dark:border-dark-border">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-2 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className="p-2 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
          >
            <Smile className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        {showEmoji && (
          <div className="absolute bottom-20 right-4">
            <EmojiPicker
              onEmojiClick={(emoji) => {
                setInput(input + emoji.emoji);
                setShowEmoji(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
