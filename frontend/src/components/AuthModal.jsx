import React, { useState } from 'react';
import { X, Mail, Lock, User, Loader2, Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';
import { registerUser, loginUser, forgotPassword, resetPassword } from '../services/api';

export default function AuthModal({ mode, setMode, onClose, onAuthSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const isLogin = mode === 'login';
  const isSignup = mode === 'signup';
  const isForgotEmail = mode === 'forgot-email';
  const isForgotOtp = mode === 'forgot-otp';

  const resetMessages = () => {
    setError('');
    setInfoMessage('');
  };

  const goToMode = (nextMode) => {
    resetMessages();
    setMode(nextMode);
  };

  const handleLoginOrSignup = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      const data = isLogin
        ? await loginUser(email, password)
        : await registerUser(name, email, password);
      onAuthSuccess(data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      await forgotPassword(email);
      setMode('forgot-otp');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      setInfoMessage('Password reset successfully. You can now log in.');
      setOtp('');
      setNewPassword('');
      setTimeout(() => {
        goToMode('login');
      }, 1800);
    } catch (err) {
      setError(err.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const titleText = isLogin
    ? 'Welcome back'
    : isSignup
      ? 'Create your account'
      : isForgotEmail
        ? 'Reset your password'
        : 'Enter reset code';

  const subtitleText = isLogin
    ? 'Log in to continue with G.A.T.E.'
    : isSignup
      ? 'Sign up to save your progress'
      : isForgotEmail
        ? "We'll email you a 6-digit code to reset your password"
        : `Enter the code sent to ${email}`;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '400px',
          background: 'rgba(15, 18, 27, 0.98)',
          border: '1px solid var(--surface-glass-border)',
          borderRadius: 'var(--radius-md)',
          padding: '32px',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)'
          }}
        >
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
          {titleText}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>
          {subtitleText}
        </p>

        {/* ---------------- LOGIN / SIGNUP ---------------- */}
        {(isLogin || isSignup) && (
          <form onSubmit={handleLoginOrSignup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {isSignup && (
              <div style={inputWrapStyle}>
                <User size={18} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
            )}

            <div style={inputWrapStyle}>
              <Mail size={18} color="var(--text-muted)" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <div style={inputWrapStyle}>
              <Lock size={18} color="var(--text-muted)" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={inputStyle}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1} style={eyeButtonStyle}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {isLogin && (
              <div style={{ textAlign: 'right', marginTop: '-6px' }}>
                <button
                  type="button"
                  onClick={() => goToMode('forgot-email')}
                  style={linkButtonStyle}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && <ErrorBox message={error} />}

            <SubmitButton loading={loading} label={isLogin ? 'Log In' : 'Sign Up'} />
          </form>
        )}

        {/* ---------------- FORGOT PASSWORD: EMAIL STEP ---------------- */}
        {isForgotEmail && (
          <form onSubmit={handleForgotEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={inputWrapStyle}>
              <Mail size={18} color="var(--text-muted)" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            {error && <ErrorBox message={error} />}

            <SubmitButton loading={loading} label="Send Reset Code" />

            <button type="button" onClick={() => goToMode('login')} style={{ ...linkButtonStyle, textAlign: 'center', marginTop: '4px' }}>
              Back to log in
            </button>
          </form>
        )}

        {/* ---------------- FORGOT PASSWORD: OTP + NEW PASSWORD STEP ---------------- */}
        {isForgotOtp && (
          <form onSubmit={handleResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={inputWrapStyle}>
              <KeyRound size={18} color="var(--text-muted)" />
              <input
                type="text"
                inputMode="numeric"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                style={{ ...inputStyle, letterSpacing: '0.3em' }}
              />
            </div>

            <div style={inputWrapStyle}>
              <Lock size={18} color="var(--text-muted)" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                style={inputStyle}
              />
              <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} tabIndex={-1} style={eyeButtonStyle}>
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && <ErrorBox message={error} />}
            {infoMessage && <SuccessBox message={infoMessage} />}

            <SubmitButton loading={loading} label="Reset Password" />

            <button type="button" onClick={() => goToMode('forgot-email')} style={{ ...linkButtonStyle, textAlign: 'center', marginTop: '4px' }}>
              Didn't get a code? Try again
            </button>
          </form>
        )}

        {(isLogin || isSignup) && (
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => goToMode(isLogin ? 'signup' : 'login')}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SubmitButton({ loading, label }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        marginTop: '8px',
        padding: '12px',
        borderRadius: 'var(--radius-full)',
        border: 'none',
        background: 'linear-gradient(135deg, var(--accent-primary) 0%, #4338ca 100%)',
        color: '#fff',
        fontWeight: 700,
        fontSize: '0.95rem',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)'
      }}
    >
      {loading && <Loader2 size={18} className="spin" />}
      {label}
    </button>
  );
}

function ErrorBox({ message }) {
  return (
    <div style={{
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 12px',
      color: '#fca5a5',
      fontSize: '0.825rem'
    }}>
      {message}
    </div>
  );
}

function SuccessBox({ message }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'rgba(16, 185, 129, 0.1)',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 12px',
      color: '#6ee7b7',
      fontSize: '0.825rem'
    }}>
      <CheckCircle2 size={16} />
      {message}
    </div>
  );
}

const inputWrapStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 14px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--surface-glass-border)',
  background: 'rgba(255, 255, 255, 0.03)'
};

const inputStyle = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: '#fff',
  fontSize: '0.9rem'
};

const eyeButtonStyle = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  padding: 0,
  color: 'var(--text-muted)'
};

const linkButtonStyle = {
  background: 'transparent',
  border: 'none',
  color: 'var(--accent-cyan)',
  fontWeight: 700,
  cursor: 'pointer',
  padding: 0,
  fontSize: '0.8rem'
};
