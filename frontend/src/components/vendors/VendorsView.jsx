import React, { useState } from 'react';

export default function VendorsView({
  vendors = [],
  searchQuery = '',
  onCreateVendor,
  onDeleteVendor,
}) {
  const [vendorName, setVendorName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vendorName.trim()) return;
    setSubmitting(true);
    const success = await onCreateVendor({
      name: vendorName.trim(),
      address: address.trim(),
      email: email.trim(),
    });
    setSubmitting(false);
    if (success) {
      setVendorName('');
      setAddress('');
      setEmail('');
    }
  };

  const q = searchQuery.toLowerCase().trim();
  const filteredVendors = vendors.filter(
    (v) =>
      !q ||
      (v.name || '').toLowerCase().includes(q) ||
      (v.email || '').toLowerCase().includes(q) ||
      (v.address || '').toLowerCase().includes(q)
  );

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          Vendor & Carrier Directory
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
          Manage wholesale fuel suppliers, refinery terminals, and freight carrier partners.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Add Vendor Form */}
        <div className="glass-panel" style={{ padding: 22 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="ms18" style={{ color: 'var(--accent-indigo)' }}>storefront</span>
            Add Supply Vendor
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  VENDOR / SUPPLIER NAME *
                </label>
                <input
                  required
                  className="modern-input"
                  placeholder="e.g. Marathon Petroleum Refinery"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  DISPATCH / BILLING EMAIL
                </label>
                <input
                  type="email"
                  className="modern-input"
                  placeholder="dispatch@marathon.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  TERMINAL ADDRESS & CITY
                </label>
                <textarea
                  className="modern-input"
                  style={{ minHeight: 70, resize: 'vertical' }}
                  placeholder="500 Refinery Way, Port Arthur TX"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="glow-btn"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={submitting || !vendorName.trim()}
            >
              <span className="ms18">add</span>
              {submitting ? 'Registering...' : 'Register Vendor'}
            </button>
          </form>
        </div>

        {/* Vendor Table */}
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Vendor / Partner</th>
                <th>Dispatch Email</th>
                <th>Terminal Location</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map((v) => (
                <tr key={v.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 800,
                          color: '#ffffff',
                          flexShrink: 0,
                        }}
                      >
                        {(v.name || 'V').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#ffffff', fontSize: 14 }}>{v.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Vendor ID #{v.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--text-secondary)' }}>
                    {v.email || '—'}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{v.address || '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="danger-btn"
                      onClick={() => onDeleteVendor(v.id)}
                      title="Delete vendor record"
                    >
                      <span className="ms16">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              {!filteredVendors.length && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                    No vendor records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
