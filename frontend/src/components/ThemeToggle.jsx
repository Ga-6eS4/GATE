import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../ThemeContext.jsx';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="btn-icon"
      title={`Switch to ${next} mode`}
      aria-label={`Switch to ${next} mode`}
      style={{
        width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--surface-glass-border)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--fill-1)', cursor: 'pointer'
      }}
    >
      {theme === 'dark'
        ? <Sun size={20} color="var(--accent-amber)" />
        : <Moon size={20} color="var(--accent-primary)" />}
    </button>
  );
}
