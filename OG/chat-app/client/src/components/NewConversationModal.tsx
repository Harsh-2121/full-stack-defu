import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { conversationApi, userApi, permissionApi } from '../services/api';
import { useAppStore } from '../store';
import toast from 'react-hot-toast';

export default function NewConversationModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<'dm' | 'group' | 'public'>('dm');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [adminEmail, setAdminEmail] = useState('');
  const { setConversations } = useAppStore();

  const searchUsers = async () => {
    if (!searchQuery) return;
    try {
      const res = await userApi.searchUsers(searchQuery);
      setUsers(res.data);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const handleCreate = async () => {
    try {
      if (type === 'public') {
        await permissionApi.requestPermission({
          serverName: name,
          serverDescription: description,
          adminEmail,
        });
        toast.success('Permission request sent! Wait for approval.');
        onClose();
      } else {
        const res = await conversationApi.createConversation({
          type,
          name: type === 'group' ? name : undefined,
          memberIds: selectedUsers,
        });
        const convRes = await conversationApi.getConversations();
        setConversations(convRes.data);
        toast.success('Conversation created!');
        onClose();
      }
    } catch (error) {
      toast.error('Failed to create');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-light-surface dark:bg-dark-surface rounded-2xl p-6 max-w-md w-full m-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">New Conversation</h2>
          <button onClick={onClose} className="p-1 hover:bg-light-hover dark:hover:bg-dark-hover rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(['dm', 'group', 'public'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    type === t
                      ? 'bg-primary text-white'
                      : 'bg-light-hover dark:bg-dark-hover'
                  }`}
                >
                  {t === 'dm' ? 'DM' : t === 'group' ? 'Group' : 'Server'}
                </button>
              ))}
            </div>
          </div>

          {type !== 'dm' && (
            <>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border"
              />
              {type === 'public' && (
                <>
                  <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border"
                    rows={3}
                  />
                  <input
                    type="email"
                    placeholder="Admin Email for Approval"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border"
                  />
                </>
              )}
            </>
          )}

          {type !== 'public' && (
            <>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                  className="flex-1 px-4 py-2 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border"
                />
                <button
                  onClick={searchUsers}
                  className="px-4 py-2 bg-primary text-white rounded-lg"
                >
                  Search
                </button>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-2">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      if (selectedUsers.includes(u.id)) {
                        setSelectedUsers(selectedUsers.filter((id) => id !== u.id));
                      } else {
                        setSelectedUsers([...selectedUsers, u.id]);
                      }
                    }}
                    className={`w-full p-2 rounded-lg flex items-center gap-2 ${
                      selectedUsers.includes(u.id)
                        ? 'bg-primary text-white'
                        : 'bg-light-hover dark:bg-dark-hover'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold">
                      {u.displayName[0]}
                    </div>
                    <span>{u.displayName}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          <button
            onClick={handleCreate}
            disabled={
              (type !== 'dm' && !name) ||
              (type === 'public' && (!description || !adminEmail)) ||
              (type !== 'public' && selectedUsers.length === 0)
            }
            className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
          >
            {type === 'public' ? 'Request Permission' : 'Create'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
