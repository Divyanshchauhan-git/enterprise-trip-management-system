import React from 'react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';
  const isWarning = toast.type === 'warning';

  const borderColor = isSuccess ? '#10b981' : isError ? '#f43f5e' : '#f59e0b';
  const iconName = isSuccess ? 'check_circle' : isError ? 'error' : 'warning';
  const iconColor = borderColor;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 28,
        right: 28,
        background: 'rgba(12, 17, 28, 0.95)',
        backdropFilter: 'blur(20px)',
        color: '#ffffff',
        padding: '14px 20px',
        borderRadius: 12,
        fontSize: '13.5px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        zIndex: 9999,
        animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderLeft: `4px solid ${borderColor}`,
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65)',
        maxWidth: 420,
      }}
    >
      <span className="ms" style={{ color: iconColor, fontSize: 20 }}>
        {iconName}
      </span>
      <div style={{ flex: 1, lineHeight: 1.4 }}>{toast.msg}</div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 2,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span className="ms16">close</span>
        </button>
      )}
    </div>
  );
}
