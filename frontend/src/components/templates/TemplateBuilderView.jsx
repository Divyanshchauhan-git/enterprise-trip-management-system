import React, { useState } from 'react';

export default function TemplateBuilderView({
  templates = [],
  companySettings = [],
  onCreateTemplate,
}) {
  const [docType, setDocType] = useState('invoice');
  const [showLogo, setShowLogo] = useState(true);
  const [showFees, setShowFees] = useState(true);
  const [showTaxes, setShowTaxes] = useState(true);
  const [showDeliveryTimestamp, setShowDeliveryTimestamp] = useState(true);
  const [showDueDate, setShowDueDate] = useState(true);
  const [saving, setSaving] = useState(false);

  const activeCompany = companySettings[0] || {
    company_name: 'First Fuel America LLC',
    address: '100 Enterprise Way, Suite 400, Dallas TX 75201',
    phone: '(800) 555-0199',
    email: 'billing@firstfuelamerica.com',
    payment_terms: 'Net 30',
  };

  const handleSaveTemplate = async () => {
    setSaving(true);
    await onCreateTemplate({
      document_type: docType,
      show_logo: showLogo,
      show_fees: showFees,
      show_taxes: showTaxes,
    });
    setSaving(false);
  };

  const docTitle =
    docType === 'invoice'
      ? 'COMMERCIAL FUEL INVOICE'
      : docType === 'delivery_ticket'
      ? 'DELIVERY RECEIPT & TICKET'
      : 'CARRIER FREIGHT INVOICE';

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          Document Template Customizer & Live PDF Canvas
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
          Design PDF letterheads, toggle line items, brand header logos, and inspect high-fidelity live previews.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '440px 1fr', gap: 28, alignItems: 'start' }}>
        {/* Controls Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Document Type Selector */}
          <div className="glass-panel" style={{ padding: 22 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#ffffff', marginBottom: 14 }}>
              Target Document Architecture
            </div>
            {[
              {
                val: 'invoice',
                label: 'Commercial Fuel Invoice',
                sub: 'Standard customer billing document with product breakdown',
                icon: 'receipt_long',
                color: 'var(--accent-indigo)',
              },
              {
                val: 'delivery_ticket',
                label: 'Delivery Ticket & Drop Proof',
                sub: 'Driver drop verification and site receipt',
                icon: 'local_shipping',
                color: 'var(--accent-cyan)',
              },
              {
                val: 'freight_invoice',
                label: 'Carrier Freight Invoice',
                sub: 'Transport haulage rates and carrier surcharges',
                icon: 'description',
                color: 'var(--accent-amber)',
              },
            ].map((opt) => (
              <div
                key={opt.val}
                onClick={() => setDocType(opt.val)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: `1px solid ${docType === opt.val ? opt.color : 'var(--border-subtle)'}`,
                  background: docType === opt.val ? 'rgba(99, 102, 241, 0.14)' : 'rgba(255, 255, 255, 0.02)',
                  cursor: 'pointer',
                  marginBottom: 10,
                  transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: docType === opt.val ? `0 4px 20px ${opt.color}25` : 'none',
                }}
              >
                <span className="ms24" style={{ color: docType === opt.val ? opt.color : 'var(--text-muted)' }}>
                  {opt.icon}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#ffffff' }}>{opt.label}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>{opt.sub}</div>
                </div>
                {docType === opt.val && (
                  <span className="ms18" style={{ color: opt.color }}>
                    check_circle
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Layout & Calculation Toggles */}
          <div className="glass-panel" style={{ padding: 22 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#ffffff', marginBottom: 14 }}>
              Layout & Itemization Options
            </div>

            {[
              { label: 'Company Header Logo & Branding', sub: 'Render corporate badge and contact banner on header', value: showLogo, setter: setShowLogo },
              { label: 'Show Taxes & Excise Breakdown', sub: 'Calculate and itemize percentage tax lines', value: showTaxes, setter: setShowTaxes },
              { label: 'Show Surcharge & Handling Fees', sub: 'Itemize hazmat and terminal handling charges', value: showFees, setter: setShowFees },
              { label: 'Show Delivery Timestamp & GPS', sub: 'Print precise terminal arrival date and time', value: showDeliveryTimestamp, setter: setShowDeliveryTimestamp },
              { label: 'Show Payment Terms & Due Date', sub: `Render Net terms (${activeCompany.payment_terms || 'Net 30'})`, value: showDueDate, setter: setShowDueDate },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ maxWidth: 320 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#ffffff' }}>{item.label}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{item.sub}</div>
                </div>
                <button
                  className={`custom-toggle ${item.value ? 'active' : ''}`}
                  onClick={() => item.setter(!item.value)}
                />
              </div>
            ))}
          </div>

          <button
            className="glow-btn"
            style={{ justifyContent: 'center', padding: '12px' }}
            onClick={handleSaveTemplate}
            disabled={saving}
          >
            <span className="ms18">save</span>
            {saving ? 'Saving Preset...' : 'Save Template Configuration'}
          </button>
        </div>

        {/* Live Interactive PDF Canvas */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="ms18" style={{ color: 'var(--accent-indigo-light)' }}>
                visibility
              </span>
              Live Document Simulator
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 99,
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                fontSize: 11.5,
                color: '#34d399',
                fontWeight: 700,
              }}
            >
              <span className="status-dot" style={{ background: '#34d399' }}></span>
              Real-Time Dynamic Canvas
            </div>
          </div>

          {/* High-Fidelity Paper Simulator */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: 38,
              color: '#0f172a',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.85), 0 0 20px rgba(99, 102, 241, 0.15)',
              fontFamily: 'var(--font-sans)',
              minHeight: 580,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Watermark Seal */}
            <div
              style={{
                position: 'absolute',
                top: '40%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-25deg)',
                border: '3px dashed rgba(15, 23, 42, 0.08)',
                padding: '12px 30px',
                borderRadius: 12,
                fontSize: 28,
                fontWeight: 900,
                color: 'rgba(15, 23, 42, 0.06)',
                letterSpacing: '0.15em',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              ENTERPRISE AUDITED
            </div>

            <div>
              {/* Document Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  borderBottom: '2px solid #0f172a',
                  paddingBottom: 18,
                  marginBottom: 24,
                }}
              >
                <div>
                  {showLogo && (
                    <div
                      style={{
                        background: '#0f172a',
                        color: '#ffffff',
                        padding: '8px 18px',
                        borderRadius: 6,
                        fontWeight: 900,
                        fontSize: 13,
                        display: 'inline-block',
                        marginBottom: 8,
                        letterSpacing: '0.06em',
                      }}
                    >
                      {activeCompany.company_name || 'FIRST FUEL LOGISTICS'}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.5 }}>
                    {activeCompany.address || '100 Enterprise Way, Dallas TX'}<br />
                    {activeCompany.phone && `Tel: ${activeCompany.phone} • `}{activeCompany.email || 'billing@company.com'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '0.04em' }}>
                    {docTitle}
                  </div>
                  <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#64748b', marginTop: 2 }}>
                    #DOC-2026-00482
                  </div>
                  {showDueDate && (
                    <div style={{ fontSize: 11, color: '#e11d48', fontWeight: 800, marginTop: 4 }}>
                      TERMS: {activeCompany.payment_terms || 'Net 30'}
                    </div>
                  )}
                  {showDeliveryTimestamp && (
                    <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 2 }}>
                      Dispatched: August 17, 2026 08:30 AM
                    </div>
                  )}
                </div>
              </div>

              {/* Bill To & Ship To Boxes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24, fontSize: 12 }}>
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', letterSpacing: '0.08em', marginBottom: 4 }}>
                    BILL TO CLIENT:
                  </div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 13.5 }}>Global Transportation Corp</div>
                  <div style={{ color: '#64748b', marginTop: 2 }}>450 Fleet Center Blvd, Suite 200, Austin TX</div>
                </div>

                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', letterSpacing: '0.08em', marginBottom: 4 }}>
                    SHIP-TO TERMINAL DESTINATION:
                  </div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 13.5 }}>Austin Regional Fuel Terminal #4</div>
                  <div style={{ color: '#64748b', marginTop: 2 }}>Gate B, South Tank Farm 12</div>
                </div>
              </div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 12.5 }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: '#ffffff' }}>
                    <th style={{ textAlign: 'left', padding: '9px 12px', fontSize: 11 }}>DESCRIPTION / FUEL GRADE</th>
                    <th style={{ textAlign: 'center', padding: '9px 12px', fontSize: 11 }}>QTY (GAL)</th>
                    <th style={{ textAlign: 'right', padding: '9px 12px', fontSize: 11 }}>UNIT PRICE</th>
                    <th style={{ textAlign: 'right', padding: '9px 12px', fontSize: 11 }}>TOTAL AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '11px 12px', fontWeight: 600 }}>Ultra-Low Sulfur Diesel #2 (Clear)</td>
                    <td style={{ padding: '11px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>3,500</td>
                    <td style={{ padding: '11px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>$3.2450</td>
                    <td style={{ padding: '11px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>$11,357.50</td>
                  </tr>

                  {showFees && (
                    <tr style={{ borderBottom: '1px solid #f1f5f9', color: '#475569' }}>
                      <td style={{ padding: '9px 12px' }}>Priority Hazardous Materials Handling Fee</td>
                      <td style={{ padding: '9px 12px', textAlign: 'center' }}>1</td>
                      <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>$125.00</td>
                      <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>$125.00</td>
                    </tr>
                  )}

                  {showTaxes && (
                    <tr style={{ borderBottom: '1px solid #f1f5f9', color: '#475569' }}>
                      <td style={{ padding: '9px 12px' }}>Texas State Fuel Excise Tax Basis (6.25%)</td>
                      <td style={{ padding: '9px 12px', textAlign: 'center' }}>—</td>
                      <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>6.25%</td>
                      <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>$709.84</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals Summary & Barcode */}
            <div style={{ borderTop: '2px solid #0f172a', paddingTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 16, fontWeight: 900 }}>
                <span>TOTAL AMOUNT DUE (USD)</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: '#0f172a', fontSize: 19 }}>
                  ${(11357.5 + (showFees ? 125 : 0) + (showTaxes ? 709.84 : 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 10, borderTop: '1px dashed #cbd5e1' }}>
                <div style={{ fontSize: 10.5, color: '#94a3b8' }}>
                  Electronic Document Validation • Generated by Enterprise Trip Summary System
                </div>
                <div style={{ fontFamily: 'monospace', letterSpacing: '4px', fontSize: 11, color: '#64748b', fontWeight: 700 }}>
                  ||| | | |||| | || ||| |
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
