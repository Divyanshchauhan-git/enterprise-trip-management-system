import React, { useState } from 'react';

export default function ShipToView({
  shiptos = [],
  customers = [],
  searchQuery = '',
  onCreateShipTo,
  onDeleteShipTo,
  initialCustomerId = '',
}) {
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomerId || '');
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [customerFilter, setCustomerFilter] = useState(initialCustomerId || 'ALL');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId || !locationName.trim() || !address.trim()) return;
    setSubmitting(true);
    const success = await onCreateShipTo({
      customer_id: Number(selectedCustomerId),
      name: locationName.trim(),
      address: address.trim(),
    });
    setSubmitting(false);
    if (success) {
      setLocationName('');
      setAddress('');
    }
  };

  const q = searchQuery.toLowerCase().trim();
  const filteredShipTos = shiptos.filter((s) => {
    const matchesSearch =
      !q ||
      (s.name || '').toLowerCase().includes(q) ||
      (s.address || '').toLowerCase().includes(q);

    const matchesCustomer =
      customerFilter === 'ALL' ||
      String(s.customer_id) === String(customerFilter);

    return matchesSearch && matchesCustomer;
  });

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          Ship-To Drop-off Terminals
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
          Manage physical fuel delivery sites, terminal drop points, and customer distribution links.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Form Panel */}
        <div className="glass-panel" style={{ padding: 22 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="ms18" style={{ color: 'var(--accent-indigo)' }}>pin_drop</span>
            Add Delivery Terminal
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  LINKED CUSTOMER ACCOUNT *
                </label>
                <select
                  required
                  className="modern-select"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                >
                  <option value="">— Select Customer —</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  SITE / TERMINAL NAME *
                </label>
                <input
                  required
                  className="modern-input"
                  placeholder="e.g. Austin Regional Fuel Farm #4"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  DELIVERY ADDRESS & GPS/GATE INFO *
                </label>
                <textarea
                  required
                  className="modern-input"
                  style={{ minHeight: 70, resize: 'vertical' }}
                  placeholder="400 South Bypass Hwy, Gate B, Austin TX 78701"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="glow-btn"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={submitting || !selectedCustomerId || !locationName.trim()}
            >
              <span className="ms18">add_location</span>
              {submitting ? 'Registering...' : 'Register Site'}
            </button>
          </form>
        </div>

        {/* Directory Table Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Customer Filter Bar */}
          <div className="glass-panel" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                FILTER BY CUSTOMER:
              </span>
              <select
                className="modern-select"
                style={{ width: 220, padding: '6px 12px', fontSize: 12.5 }}
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
              >
                <option value="ALL">All Customers ({shiptos.length} sites)</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Showing {filteredShipTos.length} sites
            </div>
          </div>

          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Terminal Site</th>
                  <th>Assigned Customer</th>
                  <th>Address</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipTos.map((s) => {
                  const customer = customers.find((c) => c.id === s.customer_id);
                  return (
                    <tr key={s.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className="ms18" style={{ color: 'var(--accent-indigo-light)' }}>
                            pin_drop
                          </span>
                          <div>
                            <div style={{ fontWeight: 700, color: '#ffffff', fontSize: 13.5 }}>{s.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Site #{s.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            background: 'rgba(99, 102, 241, 0.12)',
                            color: 'var(--accent-indigo-light)',
                            padding: '3px 10px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {customer?.name || `Customer #${s.customer_id}`}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{s.address || '—'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="danger-btn"
                          onClick={() => onDeleteShipTo(s.id)}
                          title="Delete ship-to site"
                        >
                          <span className="ms16">delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!filteredShipTos.length && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                      No delivery terminals configured for this selection.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
