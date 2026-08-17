import React, { useState, useEffect } from 'react';

export default function CommandPalette({ isOpen, onClose, navItems, onSelectTab, trips, customers, documents }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setQuery('');
    setSelectedIndex(0);
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchingTabs = navItems.filter(
    (item) => item.label.toLowerCase().includes(q) || item.key.toLowerCase().includes(q)
  );

  const matchingTrips = (trips || [])
    .filter((t) => (t.driver_name || '').toLowerCase().includes(q) || String(t.id).includes(q))
    .slice(0, 3);

  const matchingCustomers = (customers || [])
    .filter((c) => (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q))
    .slice(0, 3);

  const matchingDocs = (documents || [])
    .filter((d) => String(d.ref_id).includes(q) || (d.type || '').toLowerCase().includes(q))
    .slice(0, 3);

  const totalResults = matchingTabs.length + matchingTrips.length + matchingCustomers.length + matchingDocs.length;

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div
        className="glass-panel animate-scale-in"
        style={{
          width: '100%',
          maxWidth: 600,
          background: 'rgba(12, 16, 28, 0.98)',
          border: '1px solid rgba(99, 102, 241, 0.45)',
          boxShadow: '0 30px 100px rgba(0, 0, 0, 0.85), 0 0 40px rgba(99, 102, 241, 0.25)',
          padding: 0,
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <span className="ms22" style={{ color: 'var(--accent-indigo)' }}>
            search
          </span>
          <input
            autoFocus
            type="text"
            placeholder="Type a command, page, trip ID, customer, or document..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 15,
              color: '#ffffff',
              fontFamily: 'var(--font-sans)',
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.08)',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            ESC
          </span>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: 380, overflowY: 'auto', padding: '12px 10px' }}>
          {/* Navigation Section */}
          {matchingTabs.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.08em',
                  padding: '4px 10px 8px',
                  textTransform: 'uppercase',
                }}
              >
                Navigation Modules
              </div>
              {matchingTabs.map((item) => (
                <div
                  key={item.key}
                  className="command-item"
                  onClick={() => {
                    onSelectTab(item.key);
                    onClose();
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="ms18" style={{ color: 'var(--accent-indigo)' }}>
                      {item.icon}
                    </span>
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Jump to view</span>
                </div>
              ))}
            </div>
          )}

          {/* Quick Trips */}
          {matchingTrips.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.08em',
                  padding: '4px 10px 8px',
                  textTransform: 'uppercase',
                }}
              >
                Fleet Trips
              </div>
              {matchingTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="command-item"
                  onClick={() => {
                    onSelectTab('trips');
                    onClose();
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="ms18" style={{ color: 'var(--accent-cyan)' }}>
                      local_shipping
                    </span>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{trip.driver_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        #TRP-{String(trip.id).padStart(4, '0')} • {trip.total_gallons} gal • {trip.status}
                      </div>
                    </div>
                  </div>
                  <span className="ms16" style={{ color: 'var(--text-muted)' }}>
                    arrow_forward
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Quick Customers */}
          {matchingCustomers.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.08em',
                  padding: '4px 10px 8px',
                  textTransform: 'uppercase',
                }}
              >
                Customer Accounts
              </div>
              {matchingCustomers.map((c) => (
                <div
                  key={c.id}
                  className="command-item"
                  onClick={() => {
                    onSelectTab('customers');
                    onClose();
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="ms18" style={{ color: 'var(--accent-emerald)' }}>
                      groups
                    </span>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.email || 'No email'}</div>
                    </div>
                  </div>
                  <span className="ms16" style={{ color: 'var(--text-muted)' }}>
                    arrow_forward
                  </span>
                </div>
              ))}
            </div>
          )}

          {totalResults === 0 && (
            <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)', fontSize: 13.5 }}>
              No matches found for "{query}".
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div
          style={{
            padding: '10px 18px',
            background: 'rgba(8, 12, 20, 0.7)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11,
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', gap: 14 }}>
            <span><strong style={{ color: '#fff' }}>↑↓</strong> to navigate</span>
            <span><strong style={{ color: '#fff' }}>↵</strong> to select</span>
            <span><strong style={{ color: '#fff' }}>esc</strong> to dismiss</span>
          </div>
          <span style={{ color: 'var(--accent-indigo-light)' }}>Command Palette</span>
        </div>
      </div>
    </div>
  );
}
