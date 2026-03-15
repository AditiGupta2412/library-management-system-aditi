'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMemberships, updateMembership } from '@/lib/services';
import { getUserData } from '@/lib/auth';

export default function UpdateMembershipPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [memberships, setMemberships] = useState([]);
  
  const [lookupId, setLookupId] = useState('');
  const [member, setMember] = useState(null);
  
  const [action, setAction] = useState('6months'); // Default: 6 months extension
  const [newEndDate, setNewEndDate] = useState('');

  useEffect(() => {
    const userData = getUserData();
    if (!userData?.isAdmin) {
      router.push('/dashboard');
      return;
    }
    fetchMembers();
  }, [router]);

  const fetchMembers = async () => {
    try {
      const resp = await getMemberships();
      setMemberships(resp.data || []);
    } catch (err) {
      setError('Failed to load members.');
    }
  };

  const calculateNewEnd = (currentEnd, act) => {
    const date = new Date(currentEnd);
    if (act === '6months') date.setMonth(date.getMonth() + 6);
    else if (act === '1year') date.setFullYear(date.getFullYear() + 1);
    else if (act === '2years') date.setFullYear(date.getFullYear() + 2);
    else if (act === 'cancel') return new Date().toISOString().split('T')[0];
    
    return date.toISOString().split('T')[0];
  };

  const handleLookup = () => {
    const m = memberships.find(mem => mem.membershipId === lookupId);
    if (m) {
      setMember(m);
      setNewEndDate(calculateNewEnd(m.endDate, action));
      setError(null);
    } else {
      setError('Membership Number not found.');
      setMember(null);
    }
  };

  const handleActionChange = (val) => {
    setAction(val);
    if (member) {
      setNewEndDate(calculateNewEnd(member.endDate, val));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!member) return;

    try {
      setLoading(true);
      await updateMembership(member._id, {
        endDate: newEndDate,
        status: action === 'cancel' ? 'Inactive' : 'Active'
      });
      alert('Membership updated successfully!');
      router.push('/admin/members');
    } catch (err) {
      setError('Update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <div className="page-header">
        <h1>✏️ Update Membership</h1>
        <p>Extend or cancel an existing membership</p>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Membership Number <span className="req">*</span></label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                className="form-control" 
                value={lookupId} 
                onChange={(e) => setLookupId(e.target.value)}
                placeholder="Enter Membership ID (e.g. MEM101)"
              />
              <button type="button" className="btn btn-secondary" onClick={handleLookup}>🔍 Lookup</button>
            </div>
          </div>

          {member && (
            <form onSubmit={handleSubmit} className="fade-in" style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
              <div style={{ background: '#f0f4ff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                <strong>Member:</strong> {member.firstName} {member.lastName} | <strong>Current Status:</strong> {member.status} | <strong>Current End Date:</strong> {new Date(member.endDate).toLocaleDateString()}
              </div>

              <div className="form-group">
                <label className="form-label">Select Action</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '10px 0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="radio" name="action" value="6months" checked={action === '6months'} onChange={() => handleActionChange('6months')} />
                    Extend 6 Months
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="radio" name="action" value="1year" checked={action === '1year'} onChange={() => handleActionChange('1year')} />
                    Extend 1 Year
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="radio" name="action" value="2years" checked={action === '2years'} onChange={() => handleActionChange('2years')} />
                    Extend 2 Years
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#f44336' }}>
                    <input type="radio" name="action" value="cancel" checked={action === 'cancel'} onChange={() => handleActionChange('cancel')} />
                    ❌ Cancel Membership
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">New End Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={newEndDate} 
                  readOnly 
                  style={{ background: '#f5f5f5' }} 
                />
              </div>

              <div className="form-actions" style={{ marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setMember(null)}>Clear</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Processing...' : '✅ Confirm Update'}
                </button>
              </div>
            </form>
          )}

          {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}
        </div>
      </div>
    </div>
  );
}
