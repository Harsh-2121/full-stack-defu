import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from './store';
import { authApi } from './services/api';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';

function App() {
  const { user, setUser, theme, connectSocket } = useAppStore();

  useEffect(() => {
    // Set theme on mount
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }

    // Check authentication
    authApi.getCurrentUser()
      .then(res => {
        setUser(res.data.user);
        connectSocket(res.data.user.id);
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  if (user === null && window.location.pathname !== '/login') {
    return <Navigate to="/login" />;
  }

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: theme === 'dark' ? '#1e293b' : '#ffffff',
            color: theme === 'dark' ? '#ffffff' : '#000000',
            borderRadius: '12px',
            border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={user ? <ChatPage /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
