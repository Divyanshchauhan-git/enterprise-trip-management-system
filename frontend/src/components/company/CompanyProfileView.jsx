import React, { useState, useEffect } from 'react';

export default function CompanyProfileView({
  companySettings = [],
  onSaveCompanySettings,
  onDeleteCompanySettings,
}) {
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (companySettings.length > 0 && !editingId) {
      const first = companySettings[0];
      setCompanyName(first.company_name || '');
      setAddress(first.address || '');
      setPhone(first.phone || '');
      setEmail(first.email || '');
      setWebsite(first.website || '');
      setPaymentTerms(first.payment_terms || 'Net 30');
      setEditingId(first.id);
    }
  }, [companySettings]);

  const handleEdit = (s) => {
    setEditingId(s.id);
    setCompanyName(s.company_name || '');
    setAddress(s.address || '');
    setPhone(s.phone || '');
    setEmail(s.email || '');
    setWebsite(s.website || '');
    setPaymentTerms(s.payment_terms || 'Net 30');
  };

  const handleCancel = () => {
    setEditingId(null);
    setCompanyName('');
    setAddress('');
    setPhone('');
    setEmail('');
    setWebsite('');
    setPaymentTerms('Net 30');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) return;
    setSubmitting(true);
    const ok = await onSaveCompanySettings(
      {
        company_name: companyName.trim(),
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim(),
        website: website.trim(),
        payment_terms: paymentTerms,
      },
      editingId
    );
    setSubmitting(false);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          Company Profile & Brand Identity
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
          Organization details, headquarters address, customer support contacts, and legal invoice payment terms.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '440px 1fr', gap: 28, alignItems: 'start' }}>
        {/* Profile Editor Form */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="ms18" style={{ color: 'var(--accent-indigo)' }}>business</span>
            {editingId ? 'Update Company Details' : 'Register Company Profile'}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  COMPANY LEGAL NAME *
                </label>
                <input
                  required
                  className="modern-input"
                  placeholder="e.g. First Fuel America LLC"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  CORPORATE HEADQUARTERS ADDRESS
                </label>
                <input
                  className="modern-input"
                  placeholder="100 Enterprise Way, Suite 400, Dallas TX 75201"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    PHONE NUMBER
                  </label>
                  <input
                    className="modern-input"
                    placeholder="(800) 555-0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    BILLING EMAIL
                  </label>
                  <input
                    type="email"
                    className="modern-input"
                    placeholder="billing@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  OFFICIAL WEBSITE URL
                </label>
                <input
                  className="modern-input"
                  placeholder="https://www.firstfuelamerica.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  DEFAULT INVOICE PAYMENT TERMS
                </label>
                <select
                  className="modern-select"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                >
                  <option value="Net 30">Net 30 Days</option>
                  <option value="Net 15">Net 15 Days</option>
                  <option value="Net 60">Net 60 Days</option>
                  <option value="Due on Receipt">Due on Immediate Receipt</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              {editingId && (
                <button type="button" className="ghost-btn" onClick={handleCancel} style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="glow-btn"
                style={{ flex: 1, justifyContent: 'center' }}
                disabled={submitting || !companyName.trim()}
              >
                <span className="ms18">save</span>
                {submitting ? 'Saving...' : editingId ? 'Update Profile' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Live Company Profile Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff' }}>
            Active Organization Profile
          </div>

          {companySettings.map((s) => (
            <div key={s.id} className="glass-panel" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: 'var(--accent-gradient)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      fontWeight: 800,
                      color: '#ffffff',
                    }}
                  >
                    {(s.company_name || 'CO').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 19, fontWeight: 800, color: '#ffffff' }}>{s.company_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <span className="status-dot" style={{ background: 'var(--accent-emerald)' }}></span>
                      Active Legal Entity
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="ghost-btn" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => handleEdit(s)}>
                    <span className="ms14">edit</span>
                    Edit
                  </button>
                  <button className="danger-btn" onClick={() => onDeleteCompanySettings(s.id)}>
                    <span className="ms16">delete</span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, fontSize: 13, borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
                    HEADQUARTERS
                  </span>
                  <span style={{ color: '#ffffff' }}>{s.address || '—'}</span>
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
                    CONTACT PHONE
                  </span>
                  <span style={{ color: '#ffffff' }}>{s.phone || '—'}</span>
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
                    OFFICIAL EMAIL
                  </span>
                  <span style={{ color: '#ffffff' }}>{s.email || '—'}</span>
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
                    INVOICE PAYMENT TERMS
                  </span>
                  <span style={{ color: 'var(--accent-indigo-light)', fontWeight: 700 }}>
                    {s.payment_terms || 'Net 30'}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {!companySettings.length && (
            <div className="glass-panel" style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No company entity configured yet. Register your legal organization details to brand invoices.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
