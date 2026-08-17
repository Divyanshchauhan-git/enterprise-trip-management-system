import React, { useState } from 'react';
import Modal from '../common/Modal';

export default function DocumentArchiveView({
  documents = [],
  searchQuery = '',
  onGeneratePdf,
  onSendEmail,
  generatingId,
}) {
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedDocForEmail, setSelectedDocForEmail] = useState(null);
  const [emailSending, setEmailSending] = useState(false);

  const q = searchQuery.toLowerCase().trim();
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      !q ||
      String(doc.ref_id).includes(q) ||
      (doc.type || '').toLowerCase().includes(q) ||
      (doc.generated_at || '').toLowerCase().includes(q);

    const matchesType =
      typeFilter === 'ALL' ||
      (doc.type || '').toUpperCase().includes(typeFilter);

    return matchesSearch && matchesType;
  });

  const handleSendEmailSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDocForEmail) return;
    setEmailSending(true);
    const docTypeNormalized =
      selectedDocForEmail.type === 'delivery'
        ? 'delivery_ticket'
        : selectedDocForEmail.type === 'freight'
        ? 'freight_invoice'
        : 'invoice';

    const filePath = `generated_documents/${selectedDocForEmail.type}_${selectedDocForEmail.ref_id}.pdf`;
    await onSendEmail({
      document_type: docTypeNormalized,
      file_path: filePath,
    });
    setEmailSending(false);
    setSelectedDocForEmail(null);
  };

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
            Generated Document Archive & Repository
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            Audit trail of generated PDF invoices, drop tickets, and dispatch routing records.
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '8px 18px', textAlign: 'center' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
            TOTAL ARCHIVED
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
            {documents.length} Files
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '12px 18px',
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', marginRight: 6 }}>
            DOCUMENT TYPE:
          </span>
          {['ALL', 'INVOICE', 'DELIVERY', 'FREIGHT'].map((t) => (
            <button
              key={t}
              className={`sub-tab-btn ${typeFilter === t ? 'active' : ''}`}
              onClick={() => setTypeFilter(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
          Showing {filteredDocs.length} archived documents
        </div>
      </div>

      {/* Documents Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Document Ref</th>
              <th>Type</th>
              <th>Generated At</th>
              <th>Audit Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.map((doc) => {
              const isGenerating = generatingId === `${doc.type}-${doc.ref_id}`;
              return (
                <tr key={doc.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="ms18" style={{ color: 'var(--accent-indigo-light)' }}>
                        picture_as_pdf
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                          DOC-{doc.ref_id}-{String(doc.id).slice(-4)}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          Ref ID #{doc.ref_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: 'var(--accent-indigo-light)',
                        padding: '3px 10px',
                        borderRadius: 99,
                        fontSize: 12,
                        fontWeight: 700,
                        textTransform: 'capitalize',
                      }}
                    >
                      {doc.type}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    {new Date(doc.generated_at).toLocaleString()}
                  </td>
                  <td>
                    <span style={{ color: '#34d399', fontSize: 12.5, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <span className="ms16">check_circle</span>
                      Validated & Stored
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 8 }}>
                      <button
                        className="ghost-btn ghost-btn-primary"
                        style={{ padding: '6px 12px', fontSize: 12 }}
                        disabled={isGenerating}
                        onClick={() => onGeneratePdf(doc.type, doc.ref_id)}
                      >
                        <span className="ms16">download</span>
                        {isGenerating ? 'Downloading...' : 'Download PDF'}
                      </button>
                      <button
                        className="ghost-btn"
                        style={{ padding: '6px 12px', fontSize: 12 }}
                        onClick={() => setSelectedDocForEmail(doc)}
                        title="Email document to configured recipients"
                      >
                        <span className="ms16">mail</span>
                        Send Email
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!filteredDocs.length && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '56px 20px', color: 'var(--text-muted)' }}>
                  <span className="ms32" style={{ display: 'block', marginBottom: 8, opacity: 0.5 }}>
                    folder_open
                  </span>
                  No documents found in archive. Generate PDFs from Fleet Trips or Invoice Configurations.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Send Email Modal */}
      {selectedDocForEmail && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedDocForEmail(null)}
          title="Dispatch PDF Document via Email"
          subtitle={`Send ${selectedDocForEmail.type} #${selectedDocForEmail.ref_id} to destination inbox`}
          maxWidth={460}
        >
          <form onSubmit={handleSendEmailSubmit}>
            <div style={{ marginBottom: 20, fontSize: 13.5, color: 'var(--text-secondary)' }}>
              This will trigger your active SMTP / Gmail provider settings to deliver the document directly to the configured routing address.
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setSelectedDocForEmail(null)}
                disabled={emailSending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="glow-btn"
                disabled={emailSending}
              >
                <span className="ms18">send</span>
                {emailSending ? 'Sending...' : 'Confirm & Send Email'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
