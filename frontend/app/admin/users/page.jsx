'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUsers, createUser, updateUser, deleteUser } from '@/lib/services';
import { getUserData } from '@/lib/auth';

export default function UserManagementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  
  const [formType, setFormType] = useState('new'); // 'new' or 'existing'
  const [lookupUsername, setLookupUsername] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    isAdmin: false,
    isActive: true
  });

  useEffect(() => {
    const userData = getUserData();
    if (!userData?.isAdmin) {
      router.push('/dashboard');
      return;
    }
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data || []);
    } catch (err) {
      setError('Failed to load users');
    }
  };

  const handleLookup = () => {
    const user = users.find(u => u.username === lookupUsername);
    if (user) {
      setFormData({
        username: user.username,
        password: '', // Don't show password
        name: user.name,
        isAdmin: user.isAdmin,
        isActive: user.isActive,
        _id: user._id
      });
      setError(null);
    } else {
      setError('User not found.');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.name || (formType === 'new' && !formData.password)) {
      setError('Please fill all mandatory fields.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (formType === 'new') {
        await createUser(formData);
        alert('User created successfully');
      } else {
        await updateUser(formData._id, formData);
        alert('User updated successfully');
      }
      setFormData({ username: '', password: '', name: '', isAdmin: false, isActive: true });
      setLookupUsername('');
      setFormType('new');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <div className="page-header">
        <h1>👤 User Management</h1>
        <p>Manage system access and permissions</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <form className="card-body" onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label className="form-label">User Type <span className="req">*</span></label>
            <div style={{ display: 'flex', gap: '2rem', padding: '10px 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="formType" 
                  value="new" 
                  checked={formType === 'new'} 
                  onChange={(e) => {
                    setFormType('new');
                    setFormData({ username: '', password: '', name: '', isAdmin: false, isActive: true });
                  }}
                  style={{ width: '18px', height: '18px' }}
                /> ➕ New User
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="formType" 
                  value="existing" 
                  checked={formType === 'existing'} 
                  onChange={(e) => setFormType('existing')}
                  style={{ width: '18px', height: '18px' }}
                /> ✏️ Existing User
              </label>
            </div>
          </div>

          {formType === 'existing' && (
            <div className="form-group" style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '8px', border: '1px solid #eee' }}>
              <label className="form-label">Lookup Username</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  value={lookupUsername} 
                  onChange={(e) => setLookupUsername(e.target.value)}
                  placeholder="Enter username to search..."
                />
                <button type="button" className="btn btn-secondary" onClick={handleLookup}>🔍 Lookup</button>
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Username <span className="req">*</span></label>
              <input
                type="text"
                name="username"
                className="form-control"
                value={formData.username}
                onChange={handleChange}
                required
                readOnly={formType === 'existing'}
                style={formType === 'existing' ? { background: '#f5f5f5' } : {}}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Full Name <span className="req">*</span></label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password {formType === 'new' ? <span className="req">*</span> : '(leave blank to keep current)'}</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required={formType === 'new'}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Permissions & Status</label>
            <div style={{ display: 'flex', gap: '2rem', padding: '10px 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  name="isActive" 
                  checked={formData.isActive} 
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px' }}
                /> Active
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  name="isAdmin" 
                  checked={formData.isAdmin} 
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px' }}
                /> Admin Access
              </label>
            </div>
          </div>

          {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}

          <div className="form-actions" style={{ marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => router.back()}>Back</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (formType === 'new' ? '✅ Create User' : '✅ Update User')}
            </button>
          </div>
        </form>
      </div>

      <h2>User List</h2>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>{u.username}</td>
                <td>{u.name}</td>
                <td><span className={`badge ${u.isAdmin ? 'badge-warning' : 'badge-info'}`}>{u.isAdmin ? 'Admin' : 'User'}</span></td>
                <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>
                   <button 
                     className="btn btn-small btn-secondary" 
                     onClick={() => {
                        setFormType('existing');
                        setLookupUsername(u.username);
                        setFormData({ ...u, password: '' });
                     }}
                   >
                     Edit
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
