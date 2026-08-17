import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';

export default function AuthView({
  onLogin,
  onSignup,
  onGoogleSuccess,
  authLoading,
  authError,
  setAuthError,
}) {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignup) {
      onSignup(username, email, password);
    } else {
      onLogin(email, password);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 50% 15%, #1e1b4b 0%, #07090e 75%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
      }}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: 460,
          padding: 40,
          background: 'rgba(12, 16, 28, 0.92)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 50px rgba(99, 102, 241, 0.25)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 18,
              background: 'var(--accent-gradient)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              boxShadow: '0 10px 30px rgba(99, 102, 241, 0.55)',
            }}
          >
            <span className="ms24" style={{ color: '#ffffff', fontSize: 28 }}>
              local_shipping
            </span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Trip Summary System
          </div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: 'var(--accent-indigo-light)',
              letterSpacing: '0.12em',
              marginTop: 4,
              textTransform: 'uppercase',
            }}
          >
            Enterprise Logistics & Billing Platform
          </div>
        </div>

        <div style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>
          {isSignup ? 'Create Enterprise Account' : 'Welcome back'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
          {isSignup
            ? 'Set up your logistics operations profile and driver telemetry access'
            : 'Sign in to access fleet dispatches, billing configurations, and PDF generation'}
        </div>

        {authError && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.15)',
              color: '#fb7185',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              padding: '12px 16px',
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span className="ms16">error</span>
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
                OPERATOR USERNAME *
              </label>
              <input
                required
                className="modern-input"
                placeholder="e.g. jmiller"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
              OFFICIAL EMAIL ADDRESS *
            </label>
            <input
              required
              type="email"
              className="modern-input"
              placeholder="e.g. admin@logisticsprime.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
              PASSWORD *
            </label>
            <input
              required
              type="password"
              className="modern-input"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="glow-btn"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14 }}
            disabled={authLoading}
          >
            {authLoading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span className="ms16" style={{ animation: 'spinSlow 0.8s linear infinite' }}>sync</span>
                Authenticating...
              </span>
            ) : isSignup ? (
              'Create Account'
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '24px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }}></div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em' }}>
            OR CONTINUE WITH
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }}></div>
        </div>

        {/* Google OAuth Button */}
        <div style={{ display: 'flex', justifyContent: 'center', minHeight: 44 }}>
          <GoogleLogin
            onSuccess={onGoogleSuccess}
            onError={() =>
              setAuthError(
                'Google sign-in was not completed. Please ensure third-party cookies/popups are allowed and http://localhost:5173 is added to Authorized JavaScript Origins in Google Cloud Console.'
              )
            }
            theme="filled_black"
            shape="pill"
            size="large"
            text="continue_with"
            width="340"
          />
        </div>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-secondary)' }}>
          {isSignup ? 'Already have an account? ' : "Don't have an account yet? "}
          <span
            style={{ color: 'var(--accent-indigo-light)', cursor: 'pointer', fontWeight: 700 }}
            onClick={() => {
              setIsSignup(!isSignup);
              setAuthError('');
            }}
          >
            {isSignup ? 'Sign in' : 'Create an account'}
          </span>
        </div>
      </div>
    </div>
  );
}
