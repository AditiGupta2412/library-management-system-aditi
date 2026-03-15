'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getUserData, clearToken } from '@/lib/auth';
import './globals.css';

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
    const userData = getUserData();
    setUser(userData);
  }, []);

  const logout = () => {
    clearToken();
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const isActive = (path) => pathname === path;

  return (
    <html lang="en">
      <head>
        <title>Axcion | Premium Library Management</title>
        <meta name="description" content="State of the art Library Management System" />
      </head>
      <body>
        <div className="app-container">
          {isClient && user && pathname !== '/login' && (
            <nav className="navbar">
              <div className="nav-left">
                <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                  <h1>Axcion<span style={{ fontWeight: 300, color: 'var(--text-muted)' }}>LMS</span></h1>
                </Link>
              </div>
              
              <div className="nav-center">
                <Link href="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>Dashboard</Link>
                <Link href="/books" className={`nav-link ${isActive('/books') ? 'active' : ''}`}>Books</Link>
                <Link href="/transactions" className={`nav-link ${isActive('/transactions') ? 'active' : ''}`}>Transactions</Link>
                <Link href="/reports" className={`nav-link ${isActive('/reports') ? 'active' : ''}`}>Reports</Link>
                
                {user.isAdmin && (
                  <>
                    <div style={{ width: '1px', height: '20px', background: '#e2e8f0', margin: '0 0.5rem' }}></div>
                    <Link href="/admin/books" className={`nav-link admin-link ${isActive('/admin/books') ? 'active' : ''}`}>Manage Stock</Link>
                    <Link href="/admin/members" className={`nav-link admin-link ${isActive('/admin/members') ? 'active' : ''}`}>Members</Link>
                    <Link href="/admin/users" className={`nav-link admin-link ${isActive('/admin/users') ? 'active' : ''}`}>Users</Link>
                  </>
                )}
              </div>

              <div className="nav-right">
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{user.name}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {user.isAdmin ? 'System Administrator' : 'Library Member'}
                  </span>
                </div>
                <button onClick={logout} className="btn-logout">
                  Logout
                </button>
              </div>
            </nav>
          )}
          <main className="page-content">{children}</main>
        </div>

        <style jsx>{`
          .nav-link.active {
            background: white;
            color: var(--primary);
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          }
          .nav-link.admin-link.active {
            background: #fffbeb;
            color: var(--warning);
          }
        `}</style>
      </body>
    </html>
  );
}
