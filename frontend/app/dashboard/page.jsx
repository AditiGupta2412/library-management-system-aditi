'use client';

import { useEffect, useState } from 'react';
import { getDashboard } from '@/lib/services';
import { isAuthenticated, getUserData } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const userData = getUserData();
    setUser(userData);

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
      <div className="loading-screen">
        <div className="spinner-glow"></div>
        <p>Initializing your workspace...</p>
      </div>
    );
  }

  const isAdmin = user?.isAdmin;

  return (
    <div className="dashboard-container">
      <div className="welcome-banner">
        <div className="welcome-text">
          <h1>Welcome back, <span className="highlight">{user?.name}</span></h1>
          <p>{isAdmin ? 'Administrator' : 'Library Member'} Control Panel</p>
        </div>
        <div className="badge-container">
          {isAdmin && <span className="admin-pill">Admin Privileges Active</span>}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <span className="stat-label">Total Books</span>
            <span className="stat-value">{stats?.totalBooks || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-label">Members</span>
            <span className="stat-value">{stats?.totalMembers || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-info">
            <span className="stat-label">Active Issues</span>
            <span className="stat-value">{stats?.activeIssues || 0}</span>
          </div>
        </div>

        {isAdmin && (
          <div className="stat-card overdue">
            <div className="stat-icon">⚠️</div>
            <div className="stat-info">
              <span className="stat-label">Overdue</span>
              <span className="stat-value">{stats?.overdueIssues || 0}</span>
            </div>
          </div>
        )}
      </div>

      <h2 className="section-title">⚡ Quick Access</h2>
      <div className="action-grid">
        {/* Common for both */}
        <div className="action-card" onClick={() => router.push('/books')}>
          <div className="action-icon">🔍</div>
          <div className="action-content">
            <h3>Search Books</h3>
            <p>Find books and check availability</p>
          </div>
        </div>

        <div className="action-card" onClick={() => router.push('/transactions')}>
          <div className="action-icon">🔄</div>
          <div className="action-content">
            <h3>Transactions</h3>
            <p>Issue, Return & Fine Payments</p>
          </div>
        </div>

        <div className="action-card" onClick={() => router.push('/reports')}>
          <div className="action-icon">📊</div>
          <div className="action-content">
            <h3>Reports</h3>
            <p>View detailed system analytics</p>
          </div>
        </div>

        {/* Admin Specific */}
        {isAdmin && (
          <>
            <div className="action-card admin" onClick={() => router.push('/admin/books')}>
              <div className="action-icon">📝</div>
              <div className="action-content">
                <h3>Manage Books</h3>
                <p>Maintenance: Add or update stock</p>
              </div>
            </div>

            <div className="action-card admin" onClick={() => router.push('/admin/members')}>
              <div className="action-icon">👥</div>
              <div className="action-content">
                <h3>Memberships</h3>
                <p>Maintenance: Manage member accounts</p>
              </div>
            </div>

            <div className="action-card admin" onClick={() => router.push('/admin/users')}>
              <div className="action-icon">👨‍💼</div>
              <div className="action-content">
                <h3>User Control</h3>
                <p>Manage staff and admin logins</p>
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .dashboard-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          animation: fadeIn 0.5s ease-out;
        }

        .welcome-banner {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 3rem;
          border-radius: 20px;
          margin-bottom: 3rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }

        .welcome-text h1 {
          font-size: 2.5rem;
          margin: 0;
          font-weight: 800;
        }

        .highlight {
          color: #ffd700;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
        }

        .admin-pill {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 600;
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 15px;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s ease;
        }

        .stat-card:hover { transform: translateY(-5px); }

        .stat-icon {
          font-size: 2.5rem;
          background: #f0f4ff;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-label { color: #666; font-size: 0.9rem; }
        .stat-value { font-size: 1.8rem; font-weight: 700; color: #333; }

        .stat-card.overdue .stat-icon { background: #fff5f5; }
        .stat-card.overdue .stat-value { color: #f44336; }

        .section-title {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          color: #333;
          font-weight: 700;
        }

        .action-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .action-card {
          background: white;
          padding: 2rem;
          border-radius: 15px;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          cursor: pointer;
          border: 1px solid #eee;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .action-card:hover {
          border-color: #667eea;
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.1);
          transform: translateY(-5px);
        }

        .action-icon {
          font-size: 2rem;
          width: 50px;
        }

        .action-content h3 { margin: 0 0 0.25rem 0; color: #333; }
        .action-content p { margin: 0; color: #777; font-size: 0.9rem; }

        .action-card.admin {
          background: #fdfdfd;
          border-left: 4px solid #764ba2;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .loading-screen {
          height: 80vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
        }
      `}</style>
    </div>
  );
}
