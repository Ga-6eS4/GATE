import React, { useState, useEffect } from 'react';
import { Lock, LogIn } from 'lucide-react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import LiveDetector from './components/LiveDetector';
import TextTranslator from './components/TextTranslator';
import SignDictionary from './components/SignDictionary';
import PracticeArena from './components/PracticeArena';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { soundFx } from './utils/sound';
import { checkBackendHealth } from './services/api';
import AuthModal from './components/AuthModal';
import AdminUsers from './components/AdminUsers';

// Tabs that require the user to be logged in
const PROTECTED_TABS = new Set(['detector', 'translator', 'practice']);

function LoginRequired({ onLoginClick }) {
  return (
    <div className="animate-fade-in glass-panel" style={{
      padding: '60px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: '16px',
      maxWidth: '480px',
      margin: '60px auto'
    }}>
      <div style={{
        width: '56px', height: '56px', borderRadius: '16px',
        background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Lock size={28} />
      </div>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Log in to continue</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
        This feature requires an account so your practice sessions and progress can be saved.
      </p>
      <button
        onClick={onLoginClick}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
          borderRadius: 'var(--radius-full)', border: 'none', fontSize: '0.9rem', fontWeight: 700,
          cursor: 'pointer', background: 'linear-gradient(135deg, var(--accent-primary) 0%, #4338ca 100%)',
          color: '#fff', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)'
        }}
      >
        <LogIn size={16} />
        Log In / Sign Up
      </button>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'detector' | 'translator' | 'dictionary' | 'practice' | 'analytics'
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [serverOnline, setServerOnline] = useState(false);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('signai_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'

  useEffect(() => {
    let mounted = true;
    const verifyHealth = async () => {
      const status = await checkBackendHealth();
      if (mounted) {
        setServerOnline(status.online);
      }
    };

    verifyHealth();
    const interval = setInterval(verifyHealth, 10000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleSoundToggle = (state) => {
    setSoundEnabled(state);
    soundFx.toggleSound(state);
  };

  const handleAuthSuccess = (data) => {
    localStorage.setItem('signai_token', data.access_token);
    localStorage.setItem('signai_user', JSON.stringify(data.user));
    setUser(data.user);
    setAuthModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('signai_token');
    localStorage.removeItem('signai_user');
    setUser(null);
    // If the user logs out while on a protected tab, send them somewhere public
    if (PROTECTED_TABS.has(activeTab)) {
      setActiveTab('dictionary');
    }
  };

  const openLogin = () => {
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  // Clicking a protected nav item while logged out opens the login modal
  // instead of switching tabs, so the person isn't dropped on a locked page.
  const handleTabChange = (tabId) => {
    if (PROTECTED_TABS.has(tabId) && !user) {
      openLogin();
      return;
    }
    setActiveTab(tabId);
  };

  const isProtectedAndLocked = PROTECTED_TABS.has(activeTab) && !user;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Background Mesh */}
      <div className="bg-mesh" />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        soundEnabled={soundEnabled}
        setSoundEnabled={handleSoundToggle}
        serverOnline={serverOnline}
        user={user}
        onAuthClick={openLogin}
        onLogout={handleLogout}
      />
      {authModalOpen && (
        <AuthModal
          mode={authMode}
          setMode={setAuthMode}
          onClose={() => setAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* Main App Page Content */}
      <main className="app-container" style={{ flex: 1, paddingBottom: '60px' }}>
        {isProtectedAndLocked ? (
          <LoginRequired onLoginClick={openLogin} />
        ) : (
          <>
            {activeTab === 'home' && (
              <Home onNavigate={handleTabChange} onLoginClick={openLogin} />
            )}
            {activeTab === 'detector' && (
              <LiveDetector serverOnline={serverOnline} soundEnabled={soundEnabled} />
            )}
            {activeTab === 'translator' && (
              <TextTranslator soundEnabled={soundEnabled} />
            )}
            {activeTab === 'dictionary' && (
              <SignDictionary onSelectSignForPractice={() => handleTabChange('practice')} />
            )}
            {activeTab === 'practice' && (
              <PracticeArena soundEnabled={soundEnabled} />
            )}
            {activeTab === 'analytics' && (
              <AnalyticsDashboard serverOnline={serverOnline} setServerOnline={setServerOnline} />
            )}
            {activeTab === 'admin' && (
              <AdminUsers />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--surface-glass-border)',
        background: 'var(--footer-bg)',
        padding: '24px 0',
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}>
        <div className="app-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong style={{ color: 'var(--text-secondary)' }}>Gesture And Text Engine</strong> — ASL Gesture Recognition & Learning Engine
          </div>
          <div>
            Powered by CNN Machine Learning (26 Target Classes)
          </div>
        </div>
      </footer>

    </div>
  );
}
