'use client';

import { useEffect, useState } from 'react';
import { getActiveIssues, getOverdueIssues } from '@/lib/services';
import { isAuthenticated } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function TransactionsPage() {
  const router = useRouter();
  const [activeIssues, setActiveIssues] = useState([]);
  const [overdueIssues, setOverdueIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('active');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    fetchTransactions();
  }, [router]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const [active, overdue] = await Promise.all([
        getActiveIssues(),
        getOverdueIssues(),
      ]);
      setActiveIssues(active);
      setOverdueIssues(overdue);
      setError('');
    } catch (err) {
      setError('Failed to load transactions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading transactions...</p>
      </div>
    );
  }

  const displayIssues = tab === 'active' ? activeIssues : overdueIssues;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem', color: '#667eea' }}>🔄 Transactions</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => router.push('/transactions/issue')} className="btn btn-primary">
          📖 Issue Book
        </button>
        <button onClick={() => router.push('/transactions/return')} className="btn btn-secondary">
          ↩️ Return Book
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #eee' }}>
        <button
          onClick={() => setTab('active')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: tab === 'active' ? '#667eea' : '#f0f0f0',
            color: tab === 'active' ? 'white' : '#333',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
          }}
        >
          ⚡ Active Issues ({activeIssues.length})
        </button>
        <button
          onClick={() => setTab('overdue')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: tab === 'overdue' ? '#f44336' : '#f0f0f0',
            color: tab === 'overdue' ? 'white' : '#333',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
          }}
        >
          ⚠️ Overdue Issues ({overdueIssues.length})
        </button>
      </div>

      {displayIssues.length === 0 ? (
        <div className="alert alert-info">
          No {tab === 'active' ? 'active' : 'overdue'} issues found.
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Issue ID</th>
              <th>Book Name</th>
              <th>Member ID</th>
              <th>Issue Date</th>
              <th>Return Date</th>
              <th>Fine (₹)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {displayIssues.map((issue) => (
              <tr key={issue._id}>
                <td>{issue.issueId}</td>
                <td>{issue.bookName}</td>
                <td>{issue.membershipId}</td>
                <td>{new Date(issue.issueDate).toLocaleDateString()}</td>
                <td>{new Date(issue.returnDate).toLocaleDateString()}</td>
                <td>{issue.fine}</td>
                <td>
                  <span style={{
                    background: issue.status === 'Active' ? '#2196f3' : '#f44336',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '4px',
                  }}>
                    {issue.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: '2rem' }}>
        <a href="/dashboard" className="btn btn-secondary">
          ← Back to Dashboard
        </a>
      </div>
    </div>
  );
}
