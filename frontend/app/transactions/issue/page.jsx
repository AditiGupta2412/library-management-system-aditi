'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { searchBooks, issueBook } from '@/lib/services';
import { isAuthenticated } from '@/lib/auth';

export default function IssueBookPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Search, 2: Results, 3: Form
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Search State
  const [searchName, setSearchName] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');
  const [results, setResults] = useState([]);
  
  // Selection State
  const [selectedBook, setSelectedBook] = useState(null);
  
  // Form State
  const [issueId, setIssueId] = useState('');
  const [membershipId, setMembershipId] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnDate, setReturnDate] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
    // Set default return date (15 days ahead)
    const date = new Date();
    date.setDate(date.getDate() + 15);
    setReturnDate(date.toISOString().split('T')[0]);
  }, [router]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchName && !searchAuthor) {
      setError('Please select at least one search option.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await searchBooks({ name: searchName, author: searchAuthor });
      // Filter only available books
      const available = data.filter(b => b.status === 'Available');
      if (available.length === 0) {
        setError('No available books found matching your search.');
      } else {
        setResults(available);
        setStep(2);
      }
    } catch (err) {
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = () => {
    if (!selectedBook) {
      setError('Please select a book to issue.');
      return;
    }
    setError('');
    setStep(3);
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!issueId || !membershipId || !issueDate || !returnDate) {
      setError('Please fill all required fields.');
      return;
    }

    // Date validations
    const today = new Date().toISOString().split('T')[0];
    if (issueDate < today) {
      setError('Issue date cannot be earlier than today.');
      return;
    }

    const maxReturn = new Date(issueDate);
    maxReturn.setDate(maxReturn.getDate() + 15);
    const maxReturnStr = maxReturn.toISOString().split('T')[0];

    if (returnDate > maxReturnStr || returnDate < issueDate) {
       setError('Return date must be between Issue date and 15 days ahead.');
       return;
    }

    setLoading(true);
    try {
      await issueBook({
        issueId,
        serialNo: selectedBook.serialNo,
        membershipId,
        bookName: selectedBook.name,
        author: selectedBook.author,
        issueDate,
        returnDate,
        remarks
      });
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to issue book.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>📖 Book Issue</h1>
        <p>Step {step} of 3</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* STEP 1: SEARCH */}
      {step === 1 && (
        <div className="card">
          <div className="card-header">Search Book Availability</div>
          <form className="card-body" onSubmit={handleSearch}>
            <div className="form-group">
              <label className="form-label">Book / Movie Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={searchName} 
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Enter name..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Author Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={searchAuthor} 
                onChange={(e) => setSearchAuthor(e.target.value)}
                placeholder="Enter author..."
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => router.back()}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Searching...' : '🔍 Search'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 2: RESULTS */}
      {step === 2 && (
        <div className="card">
          <div className="card-header">Select Book to Issue</div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Book Name</th>
                  <th>Author</th>
                  <th>Serial No</th>
                  <th>Status</th>
                  <th>Select</th>
                </tr>
              </thead>
              <tbody>
                {results.map((book) => (
                  <tr key={book._id}>
                    <td>{book.name}</td>
                    <td>{book.author}</td>
                    <td>{book.serialNo}</td>
                    <td><span className="badge badge-success">{book.status}</span></td>
                    <td className="center">
                      <input 
                        type="radio" 
                        name="bookSelect" 
                        onChange={() => setSelectedBook(book)} 
                        checked={selectedBook?._id === book._id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card-body" style={{ borderTop: '1px solid #eee' }}>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-primary" onClick={handleSelect}>Next Step →</button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: FORM */}
      {step === 3 && (
        <div className="card">
          <div className="card-header">Issue Details</div>
          <form className="card-body" onSubmit={handleIssue}>
            <div className="form-group">
              <label className="form-label">Book Name</label>
              <input className="form-control" value={selectedBook.name} readOnly style={{ background: '#f5f5f5' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Author Name</label>
              <input className="form-control" value={selectedBook.author} readOnly style={{ background: '#f5f5f5' }} />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Issue ID <span className="req">*</span></label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={issueId} 
                  onChange={(e) => setIssueId(e.target.value)}
                  placeholder="e.g. ISS101"
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Membership ID <span className="req">*</span></label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={membershipId} 
                  onChange={(e) => setMembershipId(e.target.value)}
                  placeholder="e.g. MEM001"
                  required 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Issue Date <span className="req">*</span></label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={issueDate} 
                  onChange={(e) => setIssueDate(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Return Date <span className="req">*</span></label>
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
                placeholder="Any notes..."
              ></textarea>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Processing...' : '✅ Confirm Issue'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
