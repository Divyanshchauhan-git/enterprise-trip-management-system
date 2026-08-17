import React from 'react';

export default function CustomersView({
  customers = [],
  shiptos = [],
  searchQuery = '',
  onOpenCustomerModal,
  onEditCustomer,
  onDeleteCustomer,
  onJumpToShipTo,
}) {
  const q = searchQuery.toLowerCase().trim();
  const filteredCustomers = customers.filter(
    (c) =>
      !q ||
      (c.name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.billing_address || '').toLowerCase().includes(q)
  );

  return (
    <div className="animate-fade-in">
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
            Customer Accounts
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            Manage client commercial profiles, invoicing destinations, and associated drop-off terminals.
          </div>
        </div>

        <button className="glow-btn" onClick={() => onOpenCustomerModal()}>
          <span className="ms18">person_add</span>
          <span>Add Customer Account</span>
        </button>
      </div>

      {/* Customer Directory Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Client Organization</th>
              <th>Billing Contact</th>
              <th>Linked Ship-To Sites</th>
              <th>Billing Address</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((c) => {
              const customerShipTos = shiptos.filter((s) => s.customer_id === c.id);
              const initials = (c.name || 'C').substring(0, 2).toUpperCase();

              return (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 800,
                          color: '#ffffff',
                          flexShrink: 0,
                        }}
                      >
                        {initials}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#ffffff', fontSize: 14 }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Account ID #{c.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--text-secondary)' }}>
                      {c.email || '—'}
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => onJumpToShipTo(c.id)}
                      style={{
                        background: 'rgba(99, 102, 241, 0.15)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        color: 'var(--accent-indigo-light)',
                        padding: '4px 10px',
                        borderRadius: 99,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.2s ease',
                      }}
                      title="View & manage linked Ship-To terminals"
                    >
                      <span className="ms14">pin_drop</span>
                      {customerShipTos.length} Delivery Sites
                    </button>
                  </td>
                  <td>
                    <div
                      style={{
                        color: 'var(--text-secondary)',
                        maxWidth: 260,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: 13,
                      }}
                      title={c.billing_address}
                    >
                      {c.billing_address || '—'}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 8 }}>
                      <button
                        className="ghost-btn"
                        style={{ padding: '6px 12px', fontSize: 12 }}
                        onClick={() => onEditCustomer(c)}
                        title="Edit Customer Details"
                      >
                        <span className="ms14">edit</span>
                        Edit
                      </button>
                      <button
                        className="danger-btn"
                        onClick={() => onDeleteCustomer(c.id)}
                        title="Delete customer record"
                      >
                        <span className="ms16">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!filteredCustomers.length && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '56px 20px', color: 'var(--text-muted)' }}>
                  <span className="ms32" style={{ display: 'block', marginBottom: 8, opacity: 0.5 }}>
                    groups
                  </span>
                  No customer accounts found matching your query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
