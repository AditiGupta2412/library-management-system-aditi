'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getActiveIssues, returnBook } from '@/lib/services';
import { isAuthenticated } from '@/lib/auth';

export default function ReturnBookPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeIssues, setActiveIssues] = useState([]);
  
  // Selection
  const [selectedIssueId, setSelectedIssueId] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);
  
  // Form
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchActiveIssues();
  }, [router]);

  const fetchActiveIssues = async () => {
    try {
      const data = await getActiveIssues();
      setActiveIssues(data);
    } catch (err) {
      setError('Failed to load active issues.');
    }
  };

  const handleIssueChange = (e) => {
    const issueId = e.target.value;
    setSelectedIssueId(issueId);
    if (issueId) {
      const issue = activeIssues.find(i => i.issueId === issueId);
      setSelectedIssue(issue);
      if (issue.returnDate) {
        setReturnDate(issue.returnDate.split('T')[0]);
      }
    } else {
      setSelectedIssue(null);
    }
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    if (!selectedIssueId || !returnDate) {
      setError('Please select a book and return date.');
      return;
    }

    setLoading(true);
    try {
      const result = await returnBook({ 
        issueId: selectedIssueId,
        actualReturnDate: returnDate,
        remarks 
      });
      // After return, navigate to pay fine page with the issue record
      // We'll use localStorage or state to pass data
      localStorage.setItem('pendingReturn', JSON.stringify(result));
      router.push('/transactions/pay-fine');
    } catch (err) {
      setError(err.message || 'Failed to process return.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>↩️ Return Book</h1>
        <p>Return an issued book and calculate fine</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="card-header">Return Form</div>
        <form className="card-body" onSubmit={handleReturn}>
          
          <div className="form-group">
            <label className="form-label">Search/Select Issued Book <span className="req">*</span></label>
            <select className="form-control" value={selectedIssueId} onChange={handleIssueChange} required>
              <option value="">— Select Book to Return —</option>
              {activeIssues.map(issue => (
                <option key={issue._id} value={issue.issueId}>
                  {issue.bookName} (SN: {issue.serialNo}) - {issue.membershipId}
                </option>
              ))}
            </select>
          </div>

          {selectedIssue && (
            <div className="fade-in">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Author Name</label>
                  <input className="form-control" value={selectedIssue.author} readOnly style={{ background: '#f5f5f5' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Serial Number</label>
                  <input className="form-control" value={selectedIssue.serialNo} readOnly style={{ background: '#f5f5f5' }} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Issue Date</label>
                  <input className="form-control" value={new Date(selectedIssue.issueDate).toLocaleDateString()} readOnly style={{ background: '#f5f5f5' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Actual Return Date <span className="req">*</span></label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={returnDate} 
                    onChange={(e) => setReturnDate(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Remarks (Optional)</label>
                <textarea 
                  className="form-control" 
                  value={remarks} 
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Return remarks..."
                ></textarea>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => router.back()}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading || !selectedIssue}>
              {loading ? 'Processing...' : 'Confirm Return →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
