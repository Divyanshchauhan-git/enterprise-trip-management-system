import React from 'react';

export default function Header({
  searchQuery,
  setSearchQuery,
  onOpenCommandPalette,
  activeTabTitle,
  user,
  onLogout,
  onRefreshData,
  isRefreshing,
}) {
  return (
    <header
      style={{
        height: 68,
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(12, 16, 28, 0.82)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Left Title & Global Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Search input with Quick Switcher Trigger */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(8, 12, 22, 0.75)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: '7px 16px',
            width: 360,
            transition: 'border-color 0.2s ease',
          }}
        >
          <span className="ms18" style={{ color: 'var(--text-muted)' }}>
            search
          </span>
          <input
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '13.5px',
              color: '#ffffff',
              flex: 1,
              outline: 'none',
              fontFamily: 'var(--font-sans)',
            }}
            placeholder="Search trips, accounts, PDFs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery ? (
            <button
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                fontSize: 12,
              }}
              onClick={() => setSearchQuery('')}
            >
              Clear
            </button>
          ) : (
            <button
              onClick={onOpenCommandPalette}
              style={{
                background: 'rgba(255, 255, 255, 0.07)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 6,
                padding: '2px 7px',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
              }}
              title="Open Command Palette"
            >
              ⌘K
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Sync Refresh Button */}
        <button
          onClick={onRefreshData}
          disabled={isRefreshing}
          className="ghost-btn"
          style={{ padding: '7px 12px', fontSize: '12.5px' }}
          title="Refresh real-time data"
        >
          <span
            className="ms16"
            style={{
              animation: isRefreshing ? 'spinSlow 0.8s linear infinite' : 'none',
              color: 'var(--accent-cyan)',
            }}
          >
            sync
          </span>
          <span>{isRefreshing ? 'Syncing...' : 'Sync'}</span>
        </button>

        {/* Live Backend Telemetry status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '5px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            fontSize: '12px',
            color: '#34d399',
            fontWeight: 700,
          }}
        >
          <span className="status-dot" style={{ background: '#34d399' }}></span>
          <span>System Online</span>
        </div>

        {/* Command palette button */}
        <button
          onClick={onOpenCommandPalette}
          className="ghost-btn"
          style={{ padding: '7px 10px' }}
          title="Open Command Palette (Ctrl+K)"
        >
          <span className="ms18">terminal</span>
        </button>

        {/* User Mini Avatar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '4px 10px 4px 4px',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 800,
              color: '#ffffff',
            }}
          >
            {(user?.username || 'AD').substring(0, 2).toUpperCase()}
          </div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.username || 'Admin'}
          </span>
          <button
            onClick={onLogout}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              padding: 2,
            }}
            title="Sign out"
          >
            <span className="ms16">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
