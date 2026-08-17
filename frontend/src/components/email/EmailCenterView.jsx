import React, { useState } from 'react';

export default function EmailCenterView({
  emailSettings = [],
  emailConfigs = [],
  onCreateEmailSettings,
  onDeleteEmailSettings,
  onCreateEmailConfig,
  onDeleteEmailConfig,
}) {
  // Provider Form state
  const [provider, setProvider] = useState('gmail');
  const [emailAddress, setEmailAddress] = useState('');
  const [emailToken, setEmailToken] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [submittingProvider, setSubmittingProvider] = useState(false);

  // Routing Rule Form state
  const [docType, setDocType] = useState('invoice');
  const [destEmail, setDestEmail] = useState('');
  const [submittingConfig, setSubmittingConfig] = useState(false);

  const handleProviderSubmit = async (e) => {
    e.preventDefault();
    if (!emailAddress.trim()) return;
    setSubmittingProvider(true);
    const ok = await onCreateEmailSettings({
      provider,
      email: emailAddress.trim(),
      oauth_token: emailToken.trim() || null,
      smtp_host: smtpHost.trim() || null,
      smtp_port: smtpPort ? Number(smtpPort) : null,
      smtp_password: smtpPassword.trim() || null,
      is_active: true,
    });
    setSubmittingProvider(false);
    if (ok) {
      setEmailAddress('');
      setEmailToken('');
      setSmtpHost('');
      setSmtpPassword('');
    }
  };

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    if (!destEmail.trim()) return;
    setSubmittingConfig(true);
    const ok = await onCreateEmailConfig({
      document_type: docType,
      destination_email: destEmail.trim(),
      is_active: true,
    });
    setSubmittingConfig(false);
    if (ok) {
      setDestEmail('');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          Email Delivery & Automated Routing Center
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
          Connect corporate Gmail OAuth or SMTP mail transfer servers and configure destination routing for invoices.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left Column: Provider Settings Form & Active Providers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="glass-panel" style={{ padding: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="ms18" style={{ color: 'var(--accent-indigo)' }}>mark_email_read</span>
              Configure Mail Server Provider
            </div>

            <form onSubmit={handleProviderSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    MAIL SERVICE PROVIDER *
                  </label>
                  <select
                    className="modern-select"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                  >
                    <option value="gmail">Google Gmail (App Passwords)</option>
                    <option value="smtp">Custom Enterprise SMTP Server</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    SENDER DISPATCH EMAIL *
                  </label>
                  <input
                    required
                    type="email"
                    className="modern-input"
                    placeholder="e.g. accounting@company.com"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                  />
                </div>

                {provider === 'gmail' ? (
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                      GMAIL APP PASSWORD / TOKEN *
                    </label>
                    <input
                      required
                      type="password"
                      className="modern-input"
                      placeholder="16-character Google App Password"
                      value={emailToken}
                      onChange={(e) => setEmailToken(e.target.value)}
                    />
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                          SMTP HOST *
                        </label>
                        <input
                          required
                          className="modern-input"
                          placeholder="smtp.office365.com"
                          value={smtpHost}
                          onChange={(e) => setSmtpHost(e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                          PORT
                        </label>
                        <input
                          required
                          type="number"
                          className="modern-input"
                          placeholder="587"
                          value={smtpPort}
                          onChange={(e) => setSmtpPort(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                        SMTP PASSWORD
                      </label>
                      <input
                        type="password"
                        className="modern-input"
                        placeholder="••••••••••••"
                        value={smtpPassword}
                        onChange={(e) => setSmtpPassword(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>

              <button
                type="submit"
                className="glow-btn"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={submittingProvider || !emailAddress.trim()}
              >
                <span className="ms18">save</span>
                {submittingProvider ? 'Saving Provider...' : 'Save Provider Settings'}
              </button>
            </form>
          </div>

          {/* Active Providers List */}
          <div className="glass-panel" style={{ padding: 22 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', marginBottom: 14 }}>
              Configured Mail Providers ({emailSettings.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {emailSettings.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 10,
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#ffffff', fontSize: 13.5 }}>{s.email}</div>
                    <div style={{ fontSize: 11, color: 'var(--accent-indigo-light)', textTransform: 'uppercase', fontWeight: 700, marginTop: 2 }}>
                      {s.provider} {s.smtp_host && `(${s.smtp_host}:${s.smtp_port})`}
                    </div>
                  </div>
                  <button
                    className="danger-btn"
                    onClick={() => onDeleteEmailSettings(s.id)}
                    title="Remove email provider"
                  >
                    <span className="ms16">delete</span>
                  </button>
                </div>
              ))}
              {!emailSettings.length && (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: 13 }}>
                  No mail server providers active.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Routing Rules Form & Active Rules */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="glass-panel" style={{ padding: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="ms18" style={{ color: 'var(--accent-emerald)' }}>alt_route</span>
              Document Inbound/Outbound Routing Rules
            </div>

            <form onSubmit={handleConfigSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    TRIGGERING DOCUMENT TYPE *
                  </label>
                  <select
                    className="modern-select"
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                  >
                    <option value="invoice">Customer Invoice PDF</option>
                    <option value="delivery_ticket">Delivery Ticket & Drop Proof</option>
                    <option value="freight_invoice">Carrier Freight Invoice</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    DESTINATION RECIPIENT EMAIL *
                  </label>
                  <input
                    required
                    type="email"
                    className="modern-input"
                    placeholder="e.g. ap-invoices@clientcorp.com"
                    value={destEmail}
                    onChange={(e) => setDestEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="glow-btn"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  background: 'var(--emerald-gradient)',
                  boxShadow: '0 4px 18px rgba(16, 185, 129, 0.4)',
                }}
                disabled={submittingConfig || !destEmail.trim()}
              >
                <span className="ms18">add</span>
                {submittingConfig ? 'Adding Rule...' : 'Add Auto-Routing Rule'}
              </button>
            </form>
          </div>

          {/* Active Routing Rules List */}
          <div className="glass-panel" style={{ padding: 22 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', marginBottom: 14 }}>
              Active Routing Rules ({emailConfigs.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {emailConfigs.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 10,
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#ffffff', fontSize: 13.5 }}>{c.destination_email}</div>
                    <div style={{ fontSize: 11, color: 'var(--accent-emerald)', fontWeight: 700, marginTop: 2, textTransform: 'capitalize' }}>
                      Delivers: {c.document_type.replace('_', ' ')}
                    </div>
                  </div>
                  <button
                    className="danger-btn"
                    onClick={() => onDeleteEmailConfig(c.id)}
                    title="Delete routing rule"
                  >
                    <span className="ms16">delete</span>
                  </button>
                </div>
              ))}
              {!emailConfigs.length && (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: 13 }}>
                  No routing rules configured.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
