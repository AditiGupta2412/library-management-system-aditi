'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { payFine } from '@/lib/services';
import { isAuthenticated } from '@/lib/auth';

export default function PayFinePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [issue, setIssue] = useState(null);
  const [finePaid, setFinePaid] = useState(false);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const data = localStorage.getItem('pendingReturn');
    if (data) {
      setIssue(JSON.parse(data));
    } else {
      router.push('/transactions/return');
    }
  }, [router]);

  const handleConfirm = async (e) => {
    e.preventDefault();
    
    if (issue.fine > 0 && !finePaid) {
      setError('Please check the "Fine Paid" checkbox before confirming.');
      return;
    }

    setLoading(true);
    try {
      if (issue.fine > 0) {
        await payFine({ 
          issueId: issue.issueId,
          remarks: remarks || issue.remarks
        });
      }
      // Clear storage and redirect
      localStorage.removeItem('pendingReturn');
      router.push('/dashboard');
    } catch (err) {
      setError('Failed to complete transaction.');
    } finally {
      setLoading(false);
    }
  };

  if (!issue) return <div className="loading">Loading details...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>💰 {issue.fine > 0 ? 'Pay Fine' : 'Complete Transaction'}</h1>
        <p>Review details and finalize book return</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="card-header">Transaction Summary</div>
        <form className="card-body" onSubmit={handleConfirm}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Book Name</label>
              <input className="form-control" value={issue.bookName} readOnly style={{ background: '#f5f5f5' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Serial No</label>
              <input className="form-control" value={issue.serialNo} readOnly style={{ background: '#f5f5f5' }} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-group">Issue Date</label>
              <input className="form-control" value={new Date(issue.issueDate).toLocaleDateString()} readOnly style={{ background: '#f5f5f5' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Return Date (Expected)</label>
              <input className="form-control" value={new Date(issue.returnDate).toLocaleDateString()} readOnly style={{ background: '#f5f5f5' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Fine Calculated (₹)</label>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              color: issue.fine > 0 ? '#f44336' : '#4caf50',
              padding: '0.5rem 0'
            }}>
              ₹{issue.fine}
            </div>
          </div>

          {issue.fine > 0 ? (
            <div className="form-group" style={{ 
              background: '#fff8f8', 
              padding: '1rem', 
              borderRadius: '8px', 
              border: '1px solid #ffebeb',
              marginBottom: '1.5rem'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '600' }}>
                <input 
                  type="checkbox" 
                  checked={finePaid} 
                  onChange={(e) => setFinePaid(e.target.checked)}
                  style={{ width: '20px', height: '20px' }}
                />
                Mark as Paid (₹{issue.fine})
              </label>
              <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px', marginLeft: '30px' }}>
                * Mandatory to confirm return for overdue books.
              </p>
            </div>
          ) : (
            <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
              ✅ No fine applicable. You can confirm the return directly.
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Final Remarks</label>
            <textarea 
              className="form-control" 
              value={remarks} 
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add payment or return remarks..."
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => router.push('/transactions/return')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Finalizing...' : (issue.fine > 0 ? 'Confirm Payment & Return' : 'Confirm Return')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
