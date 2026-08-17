import React, { useState } from 'react';
import Modal from '../common/Modal';

export default function NewTripModal({ isOpen, onClose, onSubmit }) {
  const [driverName, setDriverName] = useState('');
  const [totalGallons, setTotalGallons] = useState('');
  const [totalStops, setTotalStops] = useState('');
  const [status, setStatus] = useState('Active');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!driverName.trim()) return;
    setSubmitting(true);
    const success = await onSubmit({
      driver_name: driverName.trim(),
      total_gallons: Number(totalGallons) || 0,
      total_stops: Number(totalStops) || 0,
      status,
    });
    setSubmitting(false);
    if (success) {
      setDriverName('');
      setTotalGallons('');
      setTotalStops('');
      setStatus('Active');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dispatch New Fleet Trip"
      subtitle="Register driver assignment, fuel gallons, and delivery route stops"
      maxWidth={480}
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
              DRIVER FULL NAME *
            </label>
            <input
              required
              className="modern-input"
              placeholder="e.g. Marcus Vance"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
                TOTAL GALLONS
              </label>
              <input
                type="number"
                step="any"
                className="modern-input"
                placeholder="4500.00"
                value={totalGallons}
                onChange={(e) => setTotalGallons(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
                TOTAL STOPS
              </label>
              <input
                type="number"
                className="modern-input"
                placeholder="3"
                value={totalStops}
                onChange={(e) => setTotalStops(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
              DISPATCH STATUS
            </label>
            <select className="modern-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Active">Active (In Transit)</option>
              <option value="Pending">Pending (Queued)</option>
              <option value="Completed">Completed (Delivered)</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="ghost-btn" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="glow-btn" disabled={submitting || !driverName.trim()}>
            <span className="ms18">local_shipping</span>
            {submitting ? 'Dispatching...' : 'Dispatch Trip'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
