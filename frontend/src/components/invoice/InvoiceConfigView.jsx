import React, { useState } from 'react';

export default function InvoiceConfigView({
  customers = [],
  shiptos = [],
  vendors = [],
  products = [],
  fees = [],
  taxes = [],
  invoiceConfigs = [],
  onCreateInvoiceConfig,
  onDeleteInvoiceConfig,
  onGeneratePdf,
  generatingId,
}) {
  const [customerId, setCustomerId] = useState('');
  const [shiptoId, setShiptoId] = useState('');
  const [vendorId, setVendorId] = useState('');

  // Line items
  const [lineProducts, setLineProducts] = useState([{ product_id: '', quantity: '', unit_price: '' }]);
  const [lineFees, setLineFees] = useState([{ fee_id: '', quantity: '1', rate: '' }]);
  const [lineTaxes, setLineTaxes] = useState([{ tax_id: '', basis: '' }]);

  const [validationError, setValidationError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const availableShipTos = shiptos.filter((s) => String(s.customer_id) === String(customerId));

  const addProductLine = () => {
    setLineProducts([...lineProducts, { product_id: '', quantity: '', unit_price: '' }]);
  };

  const removeProductLine = (index) => {
    if (lineProducts.length > 1) {
      setLineProducts(lineProducts.filter((_, i) => i !== index));
    }
  };

  const addFeeLine = () => {
    setLineFees([...lineFees, { fee_id: '', quantity: '1', rate: '' }]);
  };

  const removeFeeLine = (index) => {
    setLineFees(lineFees.filter((_, i) => i !== index));
  };

  const addTaxLine = () => {
    setLineTaxes([...lineTaxes, { tax_id: '', basis: '' }]);
  };

  const removeTaxLine = (index) => {
    setLineTaxes(lineTaxes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!customerId) {
      setValidationError('Please select a customer account');
      return;
    }
    if (!shiptoId) {
      setValidationError('Please select a valid Ship-To delivery terminal');
      return;
    }

    const validProducts = lineProducts
      .filter((p) => p.product_id && p.quantity && p.unit_price)
      .map((p) => ({
        product_id: Number(p.product_id),
        quantity: Number(p.quantity),
        unit_price: Number(p.unit_price),
      }));

    if (!validProducts.length) {
      setValidationError('Please specify at least one product with quantity and rate');
      return;
    }

    const validFees = lineFees
      .filter((f) => f.fee_id)
      .map((f) => ({
        fee_id: Number(f.fee_id),
        quantity: Number(f.quantity) || 1,
        rate: Number(f.rate) || 0,
      }));

    const validTaxes = lineTaxes
      .filter((t) => t.tax_id)
      .map((t) => ({
        tax_id: Number(t.tax_id),
        basis: Number(t.basis) || 0,
      }));

    setSubmitting(true);
    const success = await onCreateInvoiceConfig({
      customer_id: Number(customerId),
      shipto_id: Number(shiptoId),
      vendor_id: vendorId ? Number(vendorId) : null,
      invoice_time: { hour: 8, minute: 0 },
      products: validProducts,
      fees: validFees,
      taxes: validTaxes,
    });
    setSubmitting(false);

    if (success) {
      setCustomerId('');
      setShiptoId('');
      setVendorId('');
      setLineProducts([{ product_id: '', quantity: '', unit_price: '' }]);
      setLineFees([{ fee_id: '', quantity: '1', rate: '' }]);
      setLineTaxes([{ tax_id: '', basis: '' }]);
      setValidationError('');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          Customer Invoice Configurations
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
          Pair customer accounts with delivery terminals, line fuel products, fees, and render automated PDF invoices.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '460px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Invoice Builder Form */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="ms18" style={{ color: 'var(--accent-indigo)' }}>receipt_long</span>
            Create Invoice Configuration
          </div>

          {validationError && (
            <div
              style={{
                background: 'rgba(244, 63, 94, 0.15)',
                color: '#fb7185',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 12.5,
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span className="ms16">error</span>
              {validationError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  CUSTOMER ACCOUNT *
                </label>
                <select
                  required
                  className="modern-select"
                  value={customerId}
                  onChange={(e) => {
                    setCustomerId(e.target.value);
                    setShiptoId('');
                  }}
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
                  SHIP-TO DELIVERY TERMINAL *
                </label>
                <select
                  required
                  className="modern-select"
                  value={shiptoId}
                  onChange={(e) => setShiptoId(e.target.value)}
                  disabled={!customerId}
                >
                  <option value="">
                    {customerId ? '— Select Delivery Terminal —' : 'Select Customer First'}
                  </option>
                  {availableShipTos.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.address})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  SUPPLY VENDOR (OPTIONAL)
                </label>
                <select className="modern-select" value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
                  <option value="">— No Specific Vendor —</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Line Products Section */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14, marginTop: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent-indigo-light)', letterSpacing: '0.08em' }}>
                    LINE PRODUCTS (FUEL VOLUMES) *
                  </span>
                  <button
                    type="button"
                    onClick={addProductLine}
                    className="ghost-btn"
                    style={{ padding: '3px 8px', fontSize: 11 }}
                  >
                    + Add Item
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {lineProducts.map((line, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <select
                        required
                        className="modern-select"
                        style={{ flex: 2, padding: '7px 10px', fontSize: 12.5 }}
                        value={line.product_id}
                        onChange={(e) => {
                          const updated = [...lineProducts];
                          updated[idx].product_id = e.target.value;
                          setLineProducts(updated);
                        }}
                      >
                        <option value="">Select Product</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>

                      <input
                        required
                        type="number"
                        step="any"
                        placeholder="Gallons"
                        className="modern-input"
                        style={{ flex: 1, padding: '7px 8px', fontSize: 12.5 }}
                        value={line.quantity}
                        onChange={(e) => {
                          const updated = [...lineProducts];
                          updated[idx].quantity = e.target.value;
                          setLineProducts(updated);
                        }}
                      />

                      <input
                        required
                        type="number"
                        step="0.0001"
                        placeholder="$/gal"
                        className="modern-input"
                        style={{ flex: 1, padding: '7px 8px', fontSize: 12.5 }}
                        value={line.unit_price}
                        onChange={(e) => {
                          const updated = [...lineProducts];
                          updated[idx].unit_price = e.target.value;
                          setLineProducts(updated);
                        }}
                      />

                      {lineProducts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProductLine(idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#fb7185',
                            padding: 2,
                          }}
                        >
                          <span className="ms16">remove_circle</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Surcharge Fees Section */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                    SURCHARGE FEES (OPTIONAL)
                  </span>
                  <button
                    type="button"
                    onClick={addFeeLine}
                    className="ghost-btn"
                    style={{ padding: '3px 8px', fontSize: 11 }}
                  >
                    + Add Fee
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {lineFees.map((fee, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <select
                        className="modern-select"
                        style={{ flex: 2, padding: '7px 10px', fontSize: 12.5 }}
                        value={fee.fee_id}
                        onChange={(e) => {
                          const updated = [...lineFees];
                          updated[idx].fee_id = e.target.value;
                          const selected = fees.find((f) => String(f.id) === e.target.value);
                          if (selected) updated[idx].rate = selected.default_rate;
                          setLineFees(updated);
                        }}
                      >
                        <option value="">Select Fee</option>
                        {fees.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name} (${f.default_rate})
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        placeholder="Rate $"
                        className="modern-input"
                        style={{ flex: 1, padding: '7px 8px', fontSize: 12.5 }}
                        value={fee.rate}
                        onChange={(e) => {
                          const updated = [...lineFees];
                          updated[idx].rate = e.target.value;
                          setLineFees(updated);
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => removeFeeLine(idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#fb7185',
                          padding: 2,
                        }}
                      >
                        <span className="ms16">remove_circle</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="glow-btn"
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              disabled={submitting}
            >
              <span className="ms18">save</span>
              {submitting ? 'Saving Configuration...' : 'Save Invoice Configuration'}
            </button>
          </form>
        </div>

        {/* Existing Configurations Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff' }}>
            Saved Configurations ({invoiceConfigs.length})
          </div>

          {invoiceConfigs.map((config) => {
            const customer = customers.find((c) => c.id === config.customer_id);
            const shipto = shiptos.find((s) => s.id === config.shipto_id);
            const vendor = vendors.find((v) => v.id === config.vendor_id);
            const isGeneratingInv = generatingId === `invoice-config-${config.id}`;
            const isGeneratingDel = generatingId === `delivery-config-${config.id}`;

            return (
              <div
                key={config.id}
                className="glass-panel"
                style={{
                  padding: 20,
                  borderLeft: '4px solid var(--accent-indigo)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>
                      {customer?.name || `Customer #${config.customer_id}`}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      Delivery Terminal: <strong style={{ color: '#ffffff' }}>{shipto?.name || `Site #${config.shipto_id}`}</strong>
                      {vendor && ` • Vendor: ${vendor.name}`}
                    </div>
                  </div>
                  <button
                    className="danger-btn"
                    onClick={() => onDeleteInvoiceConfig(config.id)}
                    title="Delete invoice configuration"
                  >
                    <span className="ms16">delete</span>
                  </button>
                </div>

                {/* Products Badge Summary */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(config.products || []).map((item, i) => {
                    const prod = products.find((p) => p.id === item.product_id);
                    return (
                      <span
                        key={i}
                        style={{
                          background: 'rgba(99, 102, 241, 0.15)',
                          color: 'var(--accent-indigo-light)',
                          padding: '3px 10px',
                          borderRadius: 6,
                          fontSize: 11.5,
                          fontWeight: 700,
                        }}
                      >
                        {prod?.name || `Item #${item.product_id}`}: {item.quantity} gal @ ${item.unit_price}
                      </span>
                    );
                  })}
                </div>

                {/* PDF Generation CTAs */}
                <div style={{ display: 'flex', gap: 10, borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
                  <button
                    className="glow-btn"
                    style={{ padding: '8px 14px', fontSize: '12.5px' }}
                    disabled={isGeneratingInv}
                    onClick={() => onGeneratePdf('invoice-config', config.id)}
                  >
                    <span className="ms16">receipt_long</span>
                    {isGeneratingInv ? 'Rendering PDF...' : 'Generate Invoice PDF'}
                  </button>
                  <button
                    className="ghost-btn"
                    style={{ padding: '8px 14px', fontSize: '12.5px' }}
                    disabled={isGeneratingDel}
                    onClick={() => onGeneratePdf('delivery-config', config.id)}
                  >
                    <span className="ms16">local_shipping</span>
                    {isGeneratingDel ? 'Rendering PDF...' : 'Delivery Ticket PDF'}
                  </button>
                </div>
              </div>
            );
          })}

          {!invoiceConfigs.length && (
            <div className="glass-panel" style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No invoice configurations configured yet. Fill out the form on the left to create your first billing profile.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
