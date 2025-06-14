import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; 
import axios from 'axios';

const HomePage = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get(`${API_URL}/items`);
        setItems(res.data);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to fetch items. Please try again later.');
        console.error("Fetch items error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [API_URL]);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Welcome, {user?.loginId || 'User'}!</h1>
        <br></br>
        <div>
            <Link to="/post-ad" style={{ marginRight: '15px', padding: '8px 12px', textDecoration: 'none', backgroundColor: '#007bff', color: 'white', borderRadius: '4px' }}>
                Post Ad
            </Link>
            <button onClick={handleLogout} style={{ padding: '8px 12px' }}>
                Logout
            </button>
        </div>
      </div>

      <h2>Items for Sale</h2>
      {loading && <p>Loading items...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && items.length === 0 && <p>No items found. Be the first to post!</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {items.map((item) => (
          <div key={item._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
           
            <div style={{ height: '150px', backgroundColor: '#eee', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {item.images && item.images.length > 0 ? (
                <img src={item.images[0]} alt={item.title} style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}}/>
              ) : (
                <span>No Image</span>
              )}
            </div>
            <h3 style={{ marginTop: '0', marginBottom: '5px' }}>
              <Link to={`/item/${item._id}`} style={{ textDecoration: 'none', color: '#333' }}>
                {item.title}
              </Link>
            </h3>
            <p style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#28a745' }}>₹{item.price}</p>
            <p style={{ fontSize: '0.9em', color: '#666' }}>Category: {item.category}</p>
            <p style={{ fontSize: '0.9em', color: '#666' }}>Location: {item.location}</p>
            <p style={{ fontSize: '0.8em', color: '#777' }}>Seller: {item.user?.loginId || 'Unknown'}</p>
             <Link to={`/item/${item._id}`} style={{ display: 'block', textAlign: 'center', marginTop: '10px', padding: '8px', textDecoration: 'none', backgroundColor: '#17a2b8', color: 'white', borderRadius: '4px' }}>
                View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
export default HomePage;