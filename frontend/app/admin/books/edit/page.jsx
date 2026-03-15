'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBooks, updateBook } from '@/lib/services';
import { getUserData } from '@/lib/auth';

export default function UpdateBookPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [books, setBooks] = useState([]);
  
  const [lookupName, setLookupName] = useState('');
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [selectedSerial, setSelectedSerial] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    author: '',
    category: '',
    type: 'book',
    status: 'Available',
    cost: '',
    procurementDate: '',
    quantity: '1'
  });

  useEffect(() => {
    const userData = getUserData();
    if (!userData?.isAdmin) {
      router.push('/dashboard');
      return;
    }
    fetchBooks();
  }, [router]);

  const fetchBooks = async () => {
    try {
      const resp = await getBooks();
      setBooks(resp || []);
    } catch (err) {
      setError('Failed to load books.');
    }
  };

  const handleNameChange = (val) => {
    setLookupName(val);
    const matches = books.filter(b => b.name === val);
    setFilteredBooks(matches);
    setSelectedSerial('');
    setFormData({ ...formData, name: val });
  };

  const handleSerialChange = (serial) => {
    setSelectedSerial(serial);
    const book = books.find(b => b.serialNo === serial);
    if (book) {
      setFormData({
        ...book,
        procurementDate: book.procurementDate ? book.procurementDate.split('T')[0] : ''
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSerial || !formData.name || !formData.author) {
      setError('All fields are mandatory. Please fill all details.');
      return;
    }

    try {
      setLoading(true);
      await updateBook(formData._id, {
        ...formData,
        cost: parseFloat(formData.cost),
        quantity: parseInt(formData.quantity)
      });
      alert('Updated successfully!');
      router.push('/admin/books');
    } catch (err) {
      setError('Update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <div className="page-header">
        <h1>🔄 Update Book / Movie</h1>
        <p>Update status or details of an existing item</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="card-body">
          
          <div className="form-group">
            <label className="form-label">Type <span className="req">*</span></label>
            <div style={{ display: 'flex', gap: '2rem', padding: '10px 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="radio" name="type" value="book" checked={formData.type === 'book'} onChange={handleChange} /> 📚 Book
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="radio" name="type" value="movie" checked={formData.type === 'movie'} onChange={handleChange} /> 🎬 Movie
              </label>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Book / Movie Name <span className="req">*</span></label>
              <select className="form-control" value={lookupName} onChange={(e) => handleNameChange(e.target.value)} required>
                <option value="">— Select Name —</option>
                {[...new Set(books.map(b => b.name))].map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Serial Number <span className="req">*</span></label>
              <select className="form-control" value={selectedSerial} onChange={(e) => handleSerialChange(e.target.value)} required disabled={!lookupName}>
                <option value="">— Select Serial —</option>
                {filteredBooks.map(b => (
                  <option key={b._id} value={b.serialNo}>{b.serialNo}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedSerial && (
            <div className="fade-in">
              <div className="form-group">
                <label className="form-label">Author / Director <span className="req">*</span></label>
                <input name="author" className="form-control" value={formData.author} onChange={handleChange} required />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category <span className="req">*</span></label>
                  <input name="category" className="form-control" value={formData.category} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Status <span className="req">*</span></label>
                  <select name="status" className="form-control" value={formData.status} onChange={handleChange} required>
                    <option value="Available">Available</option>
                    <option value="Issued">Issued</option>
                    <option value="Lost">Lost</option>
                    <option value="Under Repair">Under Repair</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Cost (₹) <span className="req">*</span></label>
                  <input type="number" name="cost" className="form-control" value={formData.cost} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity <span className="req">*</span></label>
                  <input type="number" name="quantity" className="form-control" value={formData.quantity} onChange={handleChange} required />
                </div>
              </div>
            </div>
          )}

          {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}

          <div className="form-actions" style={{ marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => router.back()}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading || !selectedSerial}>
              {loading ? 'Processing...' : '✅ Update Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
