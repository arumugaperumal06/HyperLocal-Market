import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './SingleItemDetailPage.css'; 

const SingleItemDetailPage = () => {
  const { id: itemId } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatedUpi, setGeneratedUpi] = useState('');
  const { user: currentUser, token } = useAuth();

  const [confirmingPurchase, setConfirmingPurchase] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');
  const [purchaseSuccess, setPurchaseSuccess] = useState('');

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
  const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:5001';

  const generateRandomUpi = useCallback((username = 'user') => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const sanitizedUsername = username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return `${sanitizedUsername || 'user'}${randomNum}@upi`;
  }, []);

  const fetchItem = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setPurchaseError('');
      setPurchaseSuccess('');
      const res = await axios.get(`${API_URL}/items/${itemId}`);
      setItem(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch item details.');
    } finally {
      setLoading(false);
    }
  }, [itemId, API_URL]);

  useEffect(() => {
    if (itemId) {
      fetchItem();
    }
  }, [itemId, fetchItem]);

  useEffect(() => {
    if (item && item.user) {
      let nameForUpi = 'seller';
      if (item.user.name) {
        nameForUpi = item.user.name.split(' ')[0];
      } else if (item.user.loginId) {
        nameForUpi = item.user.loginId.split('@')[0];
      }
      setGeneratedUpi(generateRandomUpi(nameForUpi));
    } else if (item) {
      setGeneratedUpi(generateRandomUpi('seller'));
    }
  }, [item, generateRandomUpi]);

  const handleConfirmPurchase = async () => {
    if (!currentUser) {
      setPurchaseError('You must be logged in to confirm a purchase.');
      return;
    }
    if (!window.confirm('Are you sure you want to mark this item as purchased? This action cannot be undone.')) {
      return;
    }
    setConfirmingPurchase(true);
    setPurchaseError('');
    setPurchaseSuccess('');
    try {
      const config = { headers: { 'x-auth-token': token } };
      const res = await axios.put(`${API_URL}/items/${itemId}/sell`, {}, config);
      setItem(res.data); 
      setPurchaseSuccess('Purchase confirmed successfully! This item is now marked as sold.');
    } catch (err) {
      setPurchaseError(err.response?.data?.msg || 'Failed to confirm purchase. Please try again.');
    } finally {
      setConfirmingPurchase(false);
    }
  };

  const isSeller = currentUser && item && item.user && currentUser.id === item.user._id;

  if (loading && !item) {
    return <p className="page-message">Loading item details...</p>;
  }
  if (error && !item) {
    return (
      <p className="page-message error-message">
        {error} <Link to="/">Go Home</Link>
      </p>
    );
  }
  if (!loading && !item) {
    return (
      <p className="page-message">
        Item not found. <Link to="/">Go Home</Link>
      </p>
    );
  }

  let displayImageUrl = "/placeholder.png"; 
  let displayImageAlt = "No visual available";

  if (item && item.images && item.images.length > 0 && item.images[0]) {
    displayImageUrl = `${SERVER_BASE_URL}${item.images[0]}`;
    displayImageAlt = `${item.title || 'Item'} - Image 1`;
  }

  return (
    <div className="item-detail-container">
      <Link to="/" className="back-link">
        ← Back to Listings
      </Link>

      <h1 className="item-title">
        {item?.title || 'Loading title...'}
        {item?.isSold && <span className="sold-badge">SOLD</span>}
      </h1>

      {purchaseError && <p className="alert alert-danger">{purchaseError}</p>}
      {purchaseSuccess && <p className="alert alert-success">{purchaseSuccess}</p>}

      <div className="item-image-container">
        <img
          src={displayImageUrl}
          alt={displayImageAlt}
          onError={(e) => {
            e.target.src = '/placeholder.png';
          }}
          className="item-image"
        />
      </div>

      <div className="item-price-section">
        <strong className="item-price">Price: ₹{item?.price !== undefined ? item.price.toLocaleString() : '...'}</strong>
      </div>

      {item && !isSeller && !item.isSold && currentUser && (
        <div className="purchase-action-box">
          <p>Interested in this item? Confirm your purchase with the seller.</p>
          <button
            onClick={handleConfirmPurchase}
            disabled={confirmingPurchase || item?.isSold}
            className="btn btn-confirm-purchase"
          >
            {confirmingPurchase ? 'Confirming...' : 'Confirm Purchase with Seller'}
          </button>
          <p className="purchase-note">
            Note: This marks the item as sold and notifies the seller. Arrange payment and pickup directly.
          </p>
        </div>
      )}

      {item && !isSeller && item.isSold && (
        <div className="alert alert-info item-already-sold-message">
          This item has already been marked as sold.
        </div>
      )}

      {item && !isSeller && generatedUpi && !item.isSold && (
        <div className="upi-info-box">
          <strong>UPI ID:</strong>
          <span className="upi-id-display">{generatedUpi}</span>
          <p className="upi-note">(Sample ID. Please confirm with seller before payment.)</p>
        </div>
      )}

      <div className="item-specs">
        <div className="spec-item">
          <strong>Category:</strong> {item?.category || '...'}
        </div>
        <div className="spec-item">
          <strong>Condition:</strong> {item?.condition || '...'}
        </div>
      </div>

      <div className="item-description-section">
        <strong className="description-label">Description:</strong>
        <p className="description-text">
          {item?.description || 'No description available.'}
        </p>
      </div>

      <h3 className="seller-info-heading">Seller & Pickup Info</h3>
      <div className="seller-details">
        <div className="detail-item">
          <strong>Seller:</strong> {item?.user?.loginId || 'N/A'}
          {item?.user?.name && ` (${item.user.name})`}
        </div>
        {item?.phone && (
          <div className="detail-item">
            <strong>Contact:</strong> {item.phone}
          </div>
        )}
        <div className="detail-item">
          <strong>Pickup Location:</strong> {item?.location || '...'}
        </div>
      </div>

      {item && isSeller && (
        <p className="seller-listing-note">This is your listing. You can manage it from "My Ads".</p>
      )}
    </div>
  );
};

export default SingleItemDetailPage;