import { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { conversationApi, messageApi } from '../services/api';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import { Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const { user, conversations, setConversations, activeConversation, theme, toggleTheme } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const res = await conversationApi.getConversations();
      setConversations(res.data);
    } catch (error) {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`h-screen flex ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="flex-1 flex bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <div className="h-16 border-b border-light-border dark:border-dark-border flex items-center justify-between px-6 bg-light-surface dark:bg-dark-surface">
            <div className="flex items-center gap-4">
              {activeConversation && (
                <>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                    {activeConversation.name?.[0]?.toUpperCase() || 'C'}
                  </div>
                  <div>
                    <h2 className="font-semibold">{activeConversation.name || 'Conversation'}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {activeConversation.members?.length || 0} members
                    </p>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
          {activeConversation ? <ChatWindow /> : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-2xl mb-2">Welcome to Chat App</p>
                <p>Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
