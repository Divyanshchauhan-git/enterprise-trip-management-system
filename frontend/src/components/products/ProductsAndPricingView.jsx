import React, { useState } from 'react';

export default function ProductsAndPricingView({
  products = [],
  categories = [],
  fees = [],
  taxes = [],
  onCreateCategory,
  onDeleteCategory,
  onCreateProduct,
  onDeleteProduct,
  onCreateFee,
  onDeleteFee,
  onCreateTax,
  onDeleteTax,
}) {
  const [activeSubTab, setActiveSubTab] = useState('products');

  // Form states
  const [categoryName, setCategoryName] = useState('');
  const [productName, setProductName] = useState('');
  const [productCategoryId, setProductCategoryId] = useState('');
  const [feeName, setFeeName] = useState('');
  const [feeRate, setFeeRate] = useState('');
  const [taxName, setTaxName] = useState('');
  const [taxPercentage, setTaxPercentage] = useState('');

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    const ok = await onCreateCategory({ name: categoryName.trim() });
    if (ok) setCategoryName('');
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productName.trim()) return;
    const ok = await onCreateProduct({
      name: productName.trim(),
      product_category_id: productCategoryId ? Number(productCategoryId) : null,
    });
    if (ok) {
      setProductName('');
      setProductCategoryId('');
    }
  };

  const handleAddFee = async (e) => {
    e.preventDefault();
    if (!feeName.trim()) return;
    const ok = await onCreateFee({
      name: feeName.trim(),
      default_rate: Number(feeRate) || 0,
    });
    if (ok) {
      setFeeName('');
      setFeeRate('');
    }
  };

  const handleAddTax = async (e) => {
    e.preventDefault();
    if (!taxName.trim()) return;
    const ok = await onCreateTax({
      name: taxName.trim(),
      percentage: Number(taxPercentage) || 0,
    });
    if (ok) {
      setTaxName('');
      setTaxPercentage('');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          Products, Fees & Tax Rates
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
          Catalogue of fuel grades, classifications, handling fee structures, and state excise taxes.
        </div>
      </div>

      {/* Sub navigation pills */}
      <div
        className="glass-panel"
        style={{
          padding: '8px 12px',
          marginBottom: 24,
          display: 'inline-flex',
          gap: 6,
        }}
      >
        {[
          { id: 'products', label: `Products (${products.length})`, icon: 'inventory_2' },
          { id: 'categories', label: `Categories (${categories.length})`, icon: 'category' },
          { id: 'fees', label: `Fee Structures (${fees.length})`, icon: 'payments' },
          { id: 'taxes', label: `Tax Rules (${taxes.length})`, icon: 'percent' },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`sub-tab-btn ${activeSubTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveSubTab(tab.id)}
          >
            <span className="ms16">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* PRODUCTS TAB */}
      {activeSubTab === 'products' && (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>
          <div className="glass-panel" style={{ padding: 22 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginBottom: 14 }}>
              Add Catalogue Product
            </div>
            <form onSubmit={handleAddProduct}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    PRODUCT / FUEL GRADE NAME *
                  </label>
                  <input
                    required
                    className="modern-input"
                    placeholder="e.g. Ultra-Low Sulfur Diesel #2"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    CATEGORY CLASSIFICATION
                  </label>
                  <select
                    className="modern-select"
                    value={productCategoryId}
                    onChange={(e) => setProductCategoryId(e.target.value)}
                  >
                    <option value="">— Select Category —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" className="glow-btn" style={{ width: '100%', justifyContent: 'center' }}>
                <span className="ms18">add</span>
                Add Product
              </button>
            </form>
          </div>

          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>ID</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const cat = categories.find((c) => c.id === p.product_category_id);
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#ffffff' }}>{p.name}</div>
                      </td>
                      <td>
                        <span
                          style={{
                            background: 'rgba(99, 102, 241, 0.15)',
                            color: 'var(--accent-indigo-light)',
                            padding: '3px 10px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {cat?.name || 'Unassigned'}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
                        #{p.id}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="danger-btn" onClick={() => onDeleteProduct(p.id)}>
                          <span className="ms16">delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!products.length && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                      No products registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CATEGORIES TAB */}
      {activeSubTab === 'categories' && (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>
          <div className="glass-panel" style={{ padding: 22 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginBottom: 14 }}>
              New Category
            </div>
            <form onSubmit={handleAddCategory}>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  CATEGORY NAME *
                </label>
                <input
                  required
                  className="modern-input"
                  placeholder="e.g. ULSD, Bio-Diesel, Ethanol, DEF"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              </div>
              <button type="submit" className="glow-btn" style={{ width: '100%', justifyContent: 'center' }}>
                <span className="ms18">add</span>
                Create Category
              </button>
            </form>
          </div>

          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Associated Products</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => {
                  const count = products.filter((p) => p.product_category_id === c.id).length;
                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 700, color: '#ffffff', fontSize: 14 }}>{c.name}</td>
                      <td>
                        <span style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '3px 10px', borderRadius: 6, fontSize: 12 }}>
                          {count} Products
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="danger-btn" onClick={() => onDeleteCategory(c.id)}>
                          <span className="ms16">delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!categories.length && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                      No categories registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FEES TAB */}
      {activeSubTab === 'fees' && (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>
          <div className="glass-panel" style={{ padding: 22 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginBottom: 14 }}>
              Add Fee Structure
            </div>
            <form onSubmit={handleAddFee}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    FEE DESCRIPTION *
                  </label>
                  <input
                    required
                    className="modern-input"
                    placeholder="e.g. Hazardous Materials Surcharge"
                    value={feeName}
                    onChange={(e) => setFeeName(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    DEFAULT RATE ($ USD) *
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="modern-input"
                    placeholder="125.00"
                    value={feeRate}
                    onChange={(e) => setFeeRate(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" className="glow-btn" style={{ width: '100%', justifyContent: 'center' }}>
                <span className="ms18">add</span>
                Add Fee Rate
              </button>
            </form>
          </div>

          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Fee Description</th>
                  <th>Default Rate</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((f) => (
                  <tr key={f.id}>
                    <td style={{ fontWeight: 700, color: '#ffffff' }}>{f.name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34d399', fontSize: 14 }}>
                      ${(Number(f.default_rate) || 0).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="danger-btn" onClick={() => onDeleteFee(f.id)}>
                        <span className="ms16">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {!fees.length && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                      No fee structures configured.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAXES TAB */}
      {activeSubTab === 'taxes' && (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>
          <div className="glass-panel" style={{ padding: 22 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginBottom: 14 }}>
              Add Tax Rate Rule
            </div>
            <form onSubmit={handleAddTax}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    TAX NAME / REGION *
                  </label>
                  <input
                    required
                    className="modern-input"
                    placeholder="e.g. Texas State Fuel Excise Tax"
                    value={taxName}
                    onChange={(e) => setTaxName(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    TAX PERCENTAGE (%) *
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="modern-input"
                    placeholder="6.25"
                    value={taxPercentage}
                    onChange={(e) => setTaxPercentage(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" className="glow-btn" style={{ width: '100%', justifyContent: 'center' }}>
                <span className="ms18">add</span>
                Add Tax Rule
              </button>
            </form>
          </div>

          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tax Rule Name</th>
                  <th>Percentage Rate</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {taxes.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 700, color: '#ffffff' }}>{t.name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fbbf24', fontSize: 14 }}>
                      {t.percentage}%
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="danger-btn" onClick={() => onDeleteTax(t.id)}>
                        <span className="ms16">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {!taxes.length && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                      No tax rules configured.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
