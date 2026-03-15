'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBook } from '@/lib/services';
import { getUserData } from '@/lib/auth';

export default function AddBook() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    serialNo: '',
    name: '',
    author: '',
    category: '',
    type: 'book', // Default: book
    status: 'Available',
    cost: '',
    procurementDate: new Date().toISOString().split('T')[0],
    quantity: '1'
  });

  useEffect(() => {
    const userData = getUserData();
    if (!userData?.isAdmin) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.serialNo || !formData.name || !formData.author || !formData.category) {
      setError('Please fill all mandatory fields (*).');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createBook({
        ...formData,
        cost: parseFloat(formData.cost) || 0,
        quantity: parseInt(formData.quantity) || 1
      });
      router.push('/admin/books');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <div className="page-header">
        <h1>📚 Add Book / Movie</h1>
        <p>Add a new item to the library catalog</p>
      </div>
      
      {error && <div className="alert alert-error">{error}</div>}
      
      <div className="card">
        <form onSubmit={handleSubmit} className="card-body">
          <div className="form-group">
            <label className="form-label">Type <span className="req">*</span></label>
            <div style={{ display: 'flex', gap: '2rem', padding: '10px 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="type" 
                  value="book" 
                  checked={formData.type === 'book'} 
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px' }}
                /> 📚 Book
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="type" 
                  value="movie" 
                  checked={formData.type === 'movie'} 
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px' }}
                /> 🎬 Movie
              </label>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Serial Number <span className="req">*</span></label>
              <input
                type="text"
                name="serialNo"
                className="form-control"
                value={formData.serialNo}
                onChange={handleChange}
                required
                placeholder="e.g. B001"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Name <span className="req">*</span></label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Book or Movie title"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Author / Director <span className="req">*</span></label>
              <input
                type="text"
                name="author"
                className="form-control"
                value={formData.author}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category <span className="req">*</span></label>
              <select 
                name="category" 
                className="form-control" 
                value={formData.category} 
                onChange={handleChange}
                required
              >
                <option value="">— Select Category —</option>
                <option value="Fiction">Fiction</option>
                <option value="Science">Science</option>
                <option value="History">History</option>
                <option value="Biography">Biography</option>
                <option value="Academic">Academic</option>
                <option value="Entertainment">Entertainment</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Cost (₹) <span className="req">*</span></label>
              <input
                type="number"
                name="cost"
                className="form-control"
                value={formData.cost}
                onChange={handleChange}
                required
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Quantity <span className="req">*</span></label>
              <input
                type="number"
                name="quantity"
                className="form-control"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="1"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Procurement Date <span className="req">*</span></label>
            <input
              type="date"
              name="procurementDate"
              className="form-control"
              value={formData.procurementDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => router.back()}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : '✅ Confirm Addition'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
