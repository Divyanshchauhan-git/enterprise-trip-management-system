import React, { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = 500 }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-custom" onClick={onClose}>
      <div
        className="glass-panel animate-scale-in"
        style={{
          width: '100%',
          maxWidth,
          padding: 28,
          background: 'rgba(12, 16, 28, 0.96)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 30px rgba(99, 102, 241, 0.2)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 20,
            paddingBottom: 14,
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 3 }}>
                {subtitle}
              </div>
            )}
          </div>
          <button
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              transition: 'all 0.2s ease',
            }}
            onClick={onClose}
          >
            <span className="ms18">close</span>
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}
