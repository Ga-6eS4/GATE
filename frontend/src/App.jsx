import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LiveDetector from './components/LiveDetector';
import TextTranslator from './components/TextTranslator';
import SignDictionary from './components/SignDictionary';
import PracticeArena from './components/PracticeArena';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { soundFx } from './utils/sound';
import { checkBackendHealth } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('detector'); // 'detector' | 'translator' | 'dictionary' | 'practice' | 'analytics'
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [serverOnline, setServerOnline] = useState(false);

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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Background Mesh */}
      <div className="bg-mesh" />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        soundEnabled={soundEnabled}
        setSoundEnabled={handleSoundToggle}
        serverOnline={serverOnline}
      />

      {/* Main App Page Content */}
      <main className="app-container" style={{ flex: 1, paddingBottom: '60px' }}>
        {activeTab === 'detector' && (
          <LiveDetector serverOnline={serverOnline} soundEnabled={soundEnabled} />
        )}
        {activeTab === 'translator' && (
          <TextTranslator soundEnabled={soundEnabled} />
        )}
        {activeTab === 'dictionary' && (
          <SignDictionary onSelectSignForPractice={() => setActiveTab('practice')} />
        )}
        {activeTab === 'practice' && (
          <PracticeArena soundEnabled={soundEnabled} />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard serverOnline={serverOnline} setServerOnline={setServerOnline} />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--surface-glass-border)',
        background: 'rgba(7, 9, 14, 0.9)',
        padding: '24px 0',
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}>
        <div className="app-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong style={{ color: 'var(--text-secondary)' }}>SignAI Platform</strong> — ASL Gesture Recognition & Learning Engine
          </div>
          <div>
            Powered by CNN Machine Learning (29 Target Classes)
          </div>
        </div>
      </footer>

    </div>
  );
}
