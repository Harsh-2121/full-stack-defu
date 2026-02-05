import { useState } from 'react';
import { useAppStore } from '../store';
import { Plus, Hash, MessageSquare, Users } from 'lucide-react';
import NewConversationModal from './NewConversationModal';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const { conversations, activeConversation, setActiveConversation } = useAppStore();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="w-80 border-r border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface flex flex-col">
      <div className="p-4 border-b border-light-border dark:border-dark-border flex items-center justify-between">
        <h1 className="text-xl font-bold">Conversations</h1>
        <button
          onClick={() => setShowModal(true)}
          className="p-2 rounded-lg bg-primary hover:bg-primary-dark text-white transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {conversations.map((conv, idx) => (
          <motion.button
            key={conv.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => setActiveConversation(conv)}
            className={`w-full p-4 flex items-center gap-3 hover:bg-light-hover dark:hover:bg-dark-hover transition-colors border-l-4 ${
              activeConversation?.id === conv.id
                ? 'border-primary bg-light-hover dark:bg-dark-hover'
                : 'border-transparent'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold flex-shrink-0">
              {conv.type === 'public' ? <Hash className="w-6 h-6" /> :
               conv.type === 'group' ? <Users className="w-6 h-6" /> :
               <MessageSquare className="w-6 h-6" />}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="font-semibold truncate">{conv.name || 'Unnamed'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {conv.messages?.[0]?.content || 'No messages yet'}
              </p>
            </div>
            {conv.type === 'public' && !conv.isApproved && (
              <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-500 rounded">
                Pending
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {showModal && <NewConversationModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
