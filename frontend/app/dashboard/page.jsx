'use client';

import { useEffect, useState } from 'react';
import { getDashboard } from '@/lib/services';
import { isAuthenticated } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const data = await getDashboard();
        setStats(data);
      } catch (err) {
        setError('Failed to load dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem', color: '#667eea' }}>Dashboard</h1>

      <div className="grid">
        <div className="card">
          <div className="card-title">Total Books</div>
          <div className="card-value">{stats?.totalBooks || 0}</div>
        </div>

        <div className="card">
          <div className="card-title">Total Movies</div>
          <div className="card-value">{stats?.totalMovies || 0}</div>
        </div>

        <div className="card">
          <div className="card-title">Total Members</div>
          <div className="card-value">{stats?.totalMembers || 0}</div>
        </div>

        <div className="card">
          <div className="card-title">Active Issues</div>
          <div className="card-value">{stats?.activeIssues || 0}</div>
        </div>

        <div className="card">
          <div className="card-title">Overdue Issues</div>
          <div className="card-value" style={{ color: '#f44336' }}>
            {stats?.overdueIssues || 0}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Total Users</div>
          <div className="card-value">{stats?.totalUsers || 0}</div>
        </div>
      </div>

      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <a href="/books" className="btn btn-primary" style={{ textDecoration: 'none', textAlign: 'center' }}>
          Books
        </a>
        <a href="/memberships" className="btn btn-primary" style={{ textDecoration: 'none', textAlign: 'center' }}>
          Memberships
        </a>
        <a href="/transactions" className="btn btn-primary" style={{ textDecoration: 'none', textAlign: 'center' }}>
          Transactions
        </a>
        <a href="/reports" className="btn btn-primary" style={{ textDecoration: 'none', textAlign: 'center' }}>
          Reports
        </a>
      </div>
    </div>
  );
}
