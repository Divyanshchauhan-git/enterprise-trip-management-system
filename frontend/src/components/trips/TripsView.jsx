import React, { useState } from 'react';

export default function TripsView({
  trips = [],
  searchQuery = '',
  onOpenNewTripModal,
  onGeneratePdf,
  onDeleteTrip,
  generatingId,
}) {
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter trips
  const q = searchQuery.toLowerCase().trim();
  const filteredTrips = trips.filter((t) => {
    const matchesSearch =
      !q ||
      (t.driver_name || '').toLowerCase().includes(q) ||
      String(t.id).includes(q) ||
      (t.status || '').toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'ALL' ||
      (t.status || '').toUpperCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalGallons = trips.reduce((sum, t) => sum + (Number(t.total_gallons) || 0), 0);
  const activeTripsCount = trips.filter((t) => (t.status || '').toLowerCase() === 'active').length;
  const avgGallons = trips.length > 0 ? Math.round(totalGallons / trips.length) : 0;

  const renderStatusBadge = (s) => {
    const st = (s || 'Active').toLowerCase();
    const cls =
      st === 'completed' || st === 'active'
        ? 'status-active'
        : st === 'pending' || st === 'in progress'
        ? 'status-pending'
        : 'status-cancelled';
    return (
      <span className={`status-pill ${cls}`}>
        <span className="status-dot"></span>
        {s || 'Active'}
      </span>
    );
  };

  return (
    <div className="animate-fade-in">
      {/* Top Title & CTA */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Fleet Delivery Trips
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            Manage fuel logistics dispatches, gallon delivery logs, and generate instantaneous PDF documentation.
          </div>
        </div>

        <button className="glow-btn" onClick={onOpenNewTripModal}>
          <span className="ms18">add</span>
          <span>Dispatch New Trip</span>
        </button>
      </div>

      {/* Mini KPIs Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          marginBottom: 22,
        }}
      >
        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="ms22" style={{ color: '#ffffff' }}>
              local_shipping
            </span>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
              ACTIVE FLEET ROUTES
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
              {activeTripsCount} <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/ {trips.length} Total</span>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'var(--cyan-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="ms22" style={{ color: '#ffffff' }}>
              local_gas_station
            </span>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
              TOTAL FUEL DISPATCHED
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
              {totalGallons.toLocaleString()} <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>gal</span>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'var(--emerald-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="ms22" style={{ color: '#ffffff' }}>
              speed
            </span>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
              AVG GALLONS / TRIP
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
              {avgGallons.toLocaleString()} <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>gal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '12px 18px',
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', marginRight: 6 }}>
            STATUS:
          </span>
          {['ALL', 'ACTIVE', 'PENDING', 'COMPLETED'].map((status) => (
            <button
              key={status}
              className={`sub-tab-btn ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 600 }}>
          Showing <strong style={{ color: '#ffffff' }}>{filteredTrips.length}</strong> of {trips.length} trips
        </div>
      </div>

      {/* Trips Main Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Trip ID</th>
              <th>Driver Info</th>
              <th>Fuel Gallons</th>
              <th>Stops</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Document Generation & Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrips.map((t) => (
              <tr key={t.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-indigo-light)', fontWeight: 700 }}>
                  #TRP-{String(t.id).padStart(4, '0')}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: 'rgba(99, 102, 241, 0.15)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 800,
                        color: 'var(--accent-indigo-light)',
                      }}
                    >
                      {(t.driver_name || 'D').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#ffffff', fontSize: 13.5 }}>{t.driver_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Assigned Operator</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13.5, color: '#ffffff' }}>
                  {(Number(t.total_gallons) || 0).toLocaleString()} <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>gal</span>
                </td>
                <td>
                  <span
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      padding: '3px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {t.total_stops || 0} stops
                  </span>
                </td>
                <td>{renderStatusBadge(t.status)}</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: 8 }}>
                    <button
                      className="ghost-btn ghost-btn-primary"
                      style={{ padding: '6px 12px', fontSize: 12 }}
                      disabled={generatingId === `invoice-${t.id}`}
                      onClick={() => onGeneratePdf('invoice', t.id)}
                      title="Download Trip Invoice PDF"
                    >
                      <span className="ms14">receipt_long</span>
                      {generatingId === `invoice-${t.id}` ? 'Generating...' : 'Invoice PDF'}
                    </button>
                    <button
                      className="ghost-btn"
                      style={{ padding: '6px 12px', fontSize: 12 }}
                      disabled={generatingId === `delivery-${t.id}`}
                      onClick={() => onGeneratePdf('delivery', t.id)}
                      title="Download Trip Delivery Ticket PDF"
                    >
                      <span className="ms14">local_shipping</span>
                      {generatingId === `delivery-${t.id}` ? 'Generating...' : 'Ticket PDF'}
                    </button>
                    <button
                      className="danger-btn"
                      onClick={() => onDeleteTrip(t.id)}
                      title="Delete trip dispatch"
                    >
                      <span className="ms16">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filteredTrips.length && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '56px 20px', color: 'var(--text-muted)' }}>
                  <span className="ms32" style={{ display: 'block', marginBottom: 8, opacity: 0.5 }}>
                    local_shipping
                  </span>
                  No fleet delivery trips match your current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
