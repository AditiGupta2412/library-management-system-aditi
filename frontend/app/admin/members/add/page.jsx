'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createMembership } from '@/lib/services';
import { getUserData } from '@/lib/auth';

export default function AddMember() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    membershipId: '',
    firstName: '',
    lastName: '',
    contactNumber: '',
    aadhaarCardNo: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    duration: '6months', // Default: 6 months
    status: 'Active',
    contactAddress: ''
  });

  useEffect(() => {
    const userData = getUserData();
    if (!userData?.isAdmin) {
      router.push('/dashboard');
    }
    calculateEndDate(formData.startDate, formData.duration);
  }, []);

  const calculateEndDate = (start, dur) => {
    const date = new Date(start);
    if (dur === '6months') date.setMonth(date.getMonth() + 6);
    else if (dur === '1year') date.setFullYear(date.getFullYear() + 1);
    else if (dur === '2years') date.setFullYear(date.getFullYear() + 2);
    
    setFormData(prev => ({ ...prev, endDate: date.toISOString().split('T')[0] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    
    if (name === 'startDate' || name === 'duration') {
      calculateEndDate(newFormData.startDate, newFormData.duration);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.contactAddress || formData.contactNumber.length !== 10) {
      setError('Please provide a valid 10-digit number and full address.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createMembership(formData);
      router.push('/admin/members');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <div className="page-header">
        <h1>➕ Add Membership</h1>
        <p>Register a new library member</p>
      </div>
      
      {error && <div className="alert alert-error">{error}</div>}
      
      <div className="card">
        <form onSubmit={handleSubmit} className="card-body">
          <div className="form-group">
            <label className="form-label">Membership ID <span className="req">*</span></label>
            <input
              type="text"
              name="membershipId"
              className="form-control"
              value={formData.membershipId}
              onChange={handleChange}
              required
              placeholder="e.g. MEM101"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name <span className="req">*</span></label>
              <input
                type="text"
                name="firstName"
                className="form-control"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name <span className="req">*</span></label>
              <input
                type="text"
                name="lastName"
                className="form-control"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Contact Number <span className="req">*</span></label>
              <input
                type="tel"
                name="contactNumber"
                className="form-control"
                value={formData.contactNumber}
                onChange={handleChange}
                required
                placeholder="10 digit number"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Aadhaar Card No <span className="req">*</span></label>
              <input
                type="text"
                name="aadhaarCardNo"
                className="form-control"
                value={formData.aadhaarCardNo}
                onChange={handleChange}
                required
                placeholder="XXXX XXXX XXXX"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contact Address <span className="req">*</span></label>
            <textarea
              name="contactAddress"
              className="form-control"
              value={formData.contactAddress}
              onChange={handleChange}
              required
              rows="3"
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Date <span className="req">*</span></label>
              <input
                type="date"
                name="startDate"
                className="form-control"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date (Auto)</label>
              <input
                type="date"
                name="endDate"
                className="form-control"
                value={formData.endDate}
                readOnly
                style={{ background: '#f5f5f5' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Membership Duration <span className="req">*</span></label>
            <div style={{ display: 'flex', gap: '1.5rem', padding: '10px 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="duration" 
                  value="6months" 
                  checked={formData.duration === '6months'} 
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px' }}
                /> 6 Months
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="duration" 
                  value="1year" 
                  checked={formData.duration === '1year'} 
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px' }}
                /> 1 Year
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="duration" 
                  value="2years" 
                  checked={formData.duration === '2years'} 
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px' }}
                /> 2 Years
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => router.back()}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Processing...' : '✅ Confirm Membership'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
