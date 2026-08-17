import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

export default function CustomerModal({ isOpen, onClose, onSubmit, editingCustomer }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingCustomer) {
      setName(editingCustomer.name || '');
      setEmail(editingCustomer.email || '');
      setBillingAddress(editingCustomer.billing_address || '');
    } else {
      setName('');
      setEmail('');
      setBillingAddress('');
    }
  }, [editingCustomer, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    const success = await onSubmit({
      name: name.trim(),
      email: email.trim(),
      billing_address: billingAddress.trim(),
    });
    setSubmitting(false);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingCustomer ? 'Edit Customer Account' : 'Add New Customer Account'}
      subtitle="Configure enterprise billing entity details and default communications"
      maxWidth={500}
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
              COMPANY / CUSTOMER NAME *
            </label>
            <input
              required
              className="modern-input"
              placeholder="e.g. Apex Fuels & Logistics Ltd."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
              PRIMARY BILLING EMAIL
            </label>
            <input
              type="email"
              className="modern-input"
              placeholder="invoicing@apexenergy.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
              BILLING ADDRESS & SUITE
            </label>
            <textarea
              className="modern-input"
              style={{ minHeight: 80, resize: 'vertical' }}
              placeholder="100 Enterprise Boulevard, Suite 500, Houston TX 77002"
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="ghost-btn" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="glow-btn" disabled={submitting || !name.trim()}>
            <span className="ms18">save</span>
            {submitting ? 'Saving...' : editingCustomer ? 'Update Account' : 'Create Account'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
