import React, { useState } from 'react';

export default function FreightConfigView({
  vendors = [],
  categories = [],
  fees = [],
  freightConfigs = [],
  onCreateFreightConfig,
  onDeleteFreightConfig,
  onGeneratePdf,
  generatingId,
}) {
  const [vendorId, setVendorId] = useState('');
  const [categoryRates, setCategoryRates] = useState([{ product_category_id: '', freight_rate: '', quantity: '' }]);
  const [selectedFees, setSelectedFees] = useState([{ fee_id: '', rate: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const addCategoryLine = () => {
    setCategoryRates([...categoryRates, { product_category_id: '', freight_rate: '', quantity: '' }]);
  };

  const removeCategoryLine = (idx) => {
    if (categoryRates.length > 1) {
      setCategoryRates(categoryRates.filter((_, i) => i !== idx));
    }
  };

  const addFeeLine = () => {
    setSelectedFees([...selectedFees, { fee_id: '', rate: '' }]);
  };

  const removeFeeLine = (idx) => {
    setSelectedFees(selectedFees.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!vendorId) {
      setValidationError('Please select a carrier vendor');
      return;
    }

    const validCategories = categoryRates
      .filter((c) => c.product_category_id && c.freight_rate)
      .map((c) => ({
        product_category_id: Number(c.product_category_id),
        freight_rate: Number(c.freight_rate),
        quantity: Number(c.quantity) || 1,
      }));

    if (!validCategories.length) {
      setValidationError('Please add at least one category with freight rate');
      return;
    }

    const validFees = selectedFees
      .filter((f) => f.fee_id)
      .map((f) => ({
        fee_id: Number(f.fee_id),
        rate: Number(f.rate) || 0,
      }));

    setSubmitting(true);
    const success = await onCreateFreightConfig({
      vendor_id: Number(vendorId),
      categories: validCategories,
      fees: validFees,
    });
    setSubmitting(false);

    if (success) {
      setVendorId('');
      setCategoryRates([{ product_category_id: '', freight_rate: '', quantity: '' }]);
      setSelectedFees([{ fee_id: '', rate: '' }]);
      setValidationError('');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          Vendor Freight Billing Configurations
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
          Configure freight haul rates per product category, driver surcharge fees, and generate freight invoices.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '460px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Form Panel */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="ms18" style={{ color: 'var(--accent-cyan)' }}>local_shipping</span>
            Add Freight Configuration
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
                  CARRIER VENDOR *
                </label>
                <select
                  required
                  className="modern-select"
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                >
                  <option value="">— Select Vendor Carrier —</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Freight Rates */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent-cyan)', letterSpacing: '0.08em' }}>
                    CATEGORY FREIGHT RATES *
                  </span>
                  <button
                    type="button"
                    onClick={addCategoryLine}
                    className="ghost-btn"
                    style={{ padding: '3px 8px', fontSize: 11 }}
                  >
                    + Add Rate
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {categoryRates.map((line, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <select
                        required
                        className="modern-select"
                        style={{ flex: 2, padding: '7px 10px', fontSize: 12.5 }}
                        value={line.product_category_id}
                        onChange={(e) => {
                          const updated = [...categoryRates];
                          updated[idx].product_category_id = e.target.value;
                          setCategoryRates(updated);
                        }}
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
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
                          const updated = [...categoryRates];
                          updated[idx].quantity = e.target.value;
                          setCategoryRates(updated);
                        }}
                      />

                      <input
                        required
                        type="number"
                        step="0.0001"
                        placeholder="$/gal Rate"
                        className="modern-input"
                        style={{ flex: 1, padding: '7px 8px', fontSize: 12.5 }}
                        value={line.freight_rate}
                        onChange={(e) => {
                          const updated = [...categoryRates];
                          updated[idx].freight_rate = e.target.value;
                          setCategoryRates(updated);
                        }}
                      />

                      {categoryRates.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCategoryLine(idx)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fb7185', padding: 2 }}
                        >
                          <span className="ms16">remove_circle</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Surcharge Fees */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                    CARRIER FEES (OPTIONAL)
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
                  {selectedFees.map((f, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <select
                        className="modern-select"
                        style={{ flex: 2, padding: '7px 10px', fontSize: 12.5 }}
                        value={f.fee_id}
                        onChange={(e) => {
                          const updated = [...selectedFees];
                          updated[idx].fee_id = e.target.value;
                          const found = fees.find((fee) => String(fee.id) === e.target.value);
                          if (found) updated[idx].rate = found.default_rate;
                          setSelectedFees(updated);
                        }}
                      >
                        <option value="">Select Fee</option>
                        {fees.map((fee) => (
                          <option key={fee.id} value={fee.id}>
                            {fee.name} (${fee.default_rate})
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        placeholder="Rate $"
                        className="modern-input"
                        style={{ flex: 1, padding: '7px 8px', fontSize: 12.5 }}
                        value={f.rate}
                        onChange={(e) => {
                          const updated = [...selectedFees];
                          updated[idx].rate = e.target.value;
                          setSelectedFees(updated);
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => removeFeeLine(idx)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fb7185', padding: 2 }}
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
              className="glow-btn glow-btn-cyan"
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              disabled={submitting}
            >
              <span className="ms18">save</span>
              {submitting ? 'Saving...' : 'Save Freight Configuration'}
            </button>
          </form>
        </div>

        {/* Existing Freight Configs List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff' }}>
            Active Freight Matrix ({freightConfigs.length})
          </div>

          {freightConfigs.map((config) => {
            const vendor = vendors.find((v) => v.id === config.vendor_id);
            const isGenerating = generatingId === `freight-config-${config.id}`;

            return (
              <div
                key={config.id}
                className="glass-panel"
                style={{
                  padding: 20,
                  borderLeft: '4px solid var(--accent-cyan)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>
                      {vendor?.name || `Vendor #${config.vendor_id}`}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      Freight Carrier Matrix #{config.id}
                    </div>
                  </div>
                  <button
                    className="danger-btn"
                    onClick={() => onDeleteFreightConfig(config.id)}
                    title="Delete freight config"
                  >
                    <span className="ms16">delete</span>
                  </button>
                </div>

                {/* Category Freight Rates Pills */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(config.categories || []).map((c, i) => {
                    const cat = categories.find((cat) => cat.id === c.product_category_id);
                    return (
                      <span
                        key={i}
                        style={{
                          background: 'rgba(6, 182, 212, 0.15)',
                          color: 'var(--accent-cyan)',
                          padding: '3px 10px',
                          borderRadius: 6,
                          fontSize: 11.5,
                          fontWeight: 700,
                        }}
                      >
                        {cat?.name || `Category #${c.product_category_id}`}: {c.quantity || 1} gal @ ${c.freight_rate}/gal
                      </span>
                    );
                  })}
                </div>

                {/* Freight PDF CTA */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
                  <button
                    className="glow-btn glow-btn-cyan"
                    style={{ padding: '8px 14px', fontSize: '12.5px' }}
                    disabled={isGenerating}
                    onClick={() => onGeneratePdf('freight', config.id)}
                  >
                    <span className="ms16">description</span>
                    {isGenerating ? 'Generating Freight Invoice...' : 'Generate Freight Invoice PDF'}
                  </button>
                </div>
              </div>
            );
          })}

          {!freightConfigs.length && (
            <div className="glass-panel" style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No freight billing matrices configured. Use the builder on the left to link carrier rates.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
