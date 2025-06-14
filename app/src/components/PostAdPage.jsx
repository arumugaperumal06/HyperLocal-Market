import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PostAdPage = () => {
  const { token, user: currentUser } = useAuth(); 
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', 
    title: '',
    description: '',
    price: '',
    category: 'Electronics',
    condition: 'Used - Good',
    location: '',
    phone: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { name, title, description, price, category, condition, location, phone } = formData;

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
  useEffect(() => {
    if (currentUser && currentUser.name) {
      setFormData(prevData => ({ ...prevData, name: currentUser.name }));
    }
  }, [currentUser]);


  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    } else {
      setImageFile(null);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name || !title || !description || !price || !category || !condition || !location || !phone) {
      setError('All text fields are required, including your name, location, and phone number.');
      return;
    }
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      setError('Price must be a positive number.');
      return;
    }
    if (!/^\d{10}$/.test(phone.replace(/\s+/g, ''))) {
        setError('Please enter a valid 10-digit phone number.');
        return;
    }

    setLoading(true);
    try {
      console.log("Token being sent:", token);

      const dataToSubmit = new FormData();
      dataToSubmit.append('title', title);
      dataToSubmit.append('description', description);
      dataToSubmit.append('price', parseFloat(price));
      dataToSubmit.append('category', category);
      dataToSubmit.append('condition', condition);
      dataToSubmit.append('location', location);
      dataToSubmit.append('phone', phone);
      if (imageFile) {
        dataToSubmit.append('image', imageFile);
      }

      const config = {
        headers: {
          'x-auth-token': token,
        },
      };

      const res = await axios.post(`${API_URL}/items`, dataToSubmit, config);
      
      setSuccess('Ad posted successfully! Redirecting...');
     
      setFormData({ 
        name: (currentUser && currentUser.name) ? currentUser.name : '',
        title: '', 
        description: '', 
        price: '', 
        category: 'Electronics', 
        condition: 'Used - Good', 
        location: '', 
        phone: '' 
      });
      setImageFile(null);
      if (document.querySelector('input[name="image"]')) {
        document.querySelector('input[name="image"]').value = null;
      }

      setTimeout(() => {
        navigate(`/item/${res.data._id}`);
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to post ad. Please try again.');
      console.error("Post ad error:", err.response ? err.response.data : err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '30px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Post a New Ad</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={onSubmit}>
       
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="name">Your Name* (as it will appear to buyers)</label>
          <input 
            type="text" 
            name="name" 
            value={name} 
            onChange={onChange} 
            required 
            placeholder="e.g., John Doe"
            style={{ width: '100%', padding: '8px' }}
           
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="title">Title*</label>
          <input type="text" name="title" value={title} onChange={onChange} required style={{ width: '100%', padding: '8px' }}/>
        </div>
       
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="description">Description*</label>
          <textarea name="description" value={description} onChange={onChange} rows="4" required style={{ width: '100%', padding: '8px' }}/>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="price">Price (₹)*</label>
          <input type="number" name="price" value={price} onChange={onChange} required step="0.01" style={{ width: '100%', padding: '8px' }}/>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="category">Category*</label>
          <select name="category" value={category} onChange={onChange} required style={{ width: '100%', padding: '8px' }}>
            <option value="Books">Books</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
            <option value="Stationery">Stationery</option>
            <option value="Notes">Notes</option>
            <option value="Services">Services</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="condition">Condition*</label>
          <select name="condition" value={condition} onChange={onChange} required style={{ width: '100%', padding: '8px' }}>
            <option value="New">New</option>
            <option value="Used - Like New">Used - Like New</option>
            <option value="Used - Good">Used - Good</option>
            <option value="Used - Fair">Used - Fair</option>
          </select>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="location">Pickup Location* (e.g., Library, Hostel Block C, Dept. Entrance)</label>
          <input type="text" name="location" value={location} onChange={onChange} required style={{ width: '100%', padding: '8px' }}/>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="phone">Phone Number*</label>
          <input 
            type="tel"
            name="phone" 
            value={phone} 
            onChange={onChange} 
            required 
            placeholder="e.g., 9876543210"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="image">Image (Optional)</label>
          <input 
            type="file" 
            name="image" 
            onChange={onImageChange} 
            accept="image/*"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '10px 20px', width: '100%', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}>
          {loading ? 'Posting...' : 'Post Ad'}
        </button>
      </form>
    </div>
  );
};

export default PostAdPage;