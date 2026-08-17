import React from 'react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  navItems,
  onOpenNewTripModal,
  user,
  onLogout,
}) {
  return (
    <aside
      style={{
        width: 260,
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        zIndex: 50,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '20px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 24px rgba(99, 102, 241, 0.5)',
            flexShrink: 0,
          }}
        >
          <span className="ms22" style={{ color: '#ffffff' }}>
            local_shipping
          </span>
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: '15.5px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
            }}
          >
            Trip Summary
          </div>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: 'var(--accent-indigo-light)',
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              marginTop: 2,
            }}
          >
            Enterprise Logistics
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav
        style={{
          flex: 1,
          padding: '16px 12px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <div
          style={{
            fontSize: '10px',
            fontWeight: 800,
            color: 'var(--text-muted)',
            letterSpacing: '0.1em',
            padding: '4px 10px 8px',
            textTransform: 'uppercase',
          }}
        >
          Operations & Billing
        </div>

        {navItems.map(({ key, icon, label, count, category }) => (
          <button
            key={key}
            className={`nav-item-btn ${activeTab === key ? 'active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            <span className="ms18 nav-icon" style={{ color: activeTab === key ? 'var(--accent-indigo-light)' : 'var(--text-muted)' }}>
              {icon}
            </span>
            <span style={{ flex: 1, textAlign: 'left', fontWeight: activeTab === key ? 700 : 500 }}>
              {label}
            </span>
            {count !== null && count !== undefined && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  background:
                    activeTab === key
                      ? 'rgba(99, 102, 241, 0.35)'
                      : 'rgba(255, 255, 255, 0.07)',
                  color: activeTab === key ? '#ffffff' : 'var(--text-muted)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom Dispatch Action & User Card */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          background: 'rgba(8, 12, 20, 0.5)',
        }}
      >
        <button
          className="glow-btn"
          style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
          onClick={onOpenNewTripModal}
        >
          <span className="ms18">add_circle</span>
          <span>Dispatch Trip</span>
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 12px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 10,
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 800,
              color: '#ffffff',
              flexShrink: 0,
            }}
          >
            {(user?.username || 'U').substring(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#ffffff',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.username || 'Administrator'}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--accent-emerald)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span className="status-dot" style={{ background: 'var(--accent-emerald)' }}></span>
              Online
            </div>
          </div>
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              padding: 2,
            }}
            onClick={onLogout}
            title="Sign out"
          >
            <span className="ms18">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
