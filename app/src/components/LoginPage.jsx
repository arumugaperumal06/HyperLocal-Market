import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';

const LoginPage = () => {
  const [loginId, setLoginId] = useState('');
  const [userCaptchaInput, setUserCaptchaInput] = useState('');
  const [captchaText, setCaptchaText] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(''); 

  const auth = useAuth();
  const navigate = useNavigate();

  const loadCaptcha = async () => {
    setLoading(true);
    setFormError('');
    const result = await auth.fetchCaptcha();
    setLoading(false);
    if (result.success) {
      setCaptchaText(result.captchaText);
    } else {
      setFormError(result.error || 'Failed to load CAPTCHA. Please refresh.');
      setCaptchaText('');
    }
  };

  useEffect(() => {
    if (!auth.isAuthenticated) {
        loadCaptcha();
    }
  }, [auth.isAuthenticated]); 

  if (auth.isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!loginId || !userCaptchaInput) {
      setFormError('Please enter Login ID and CAPTCHA.');
      return;
    }
    setLoading(true);
    const result = await auth.login(loginId, userCaptchaInput);
    setLoading(false);
    if (result.success) {
      navigate('/home');
    } else {
      setFormError(result.error || 'Login failed. Please try again.');
      setUserCaptchaInput(''); 
      if (result.newCaptchaText) { 
          setCaptchaText(result.newCaptchaText);
      } else {
          loadCaptcha(); 
      }
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <h2>Login</h2>
      {formError && <p style={{ color: 'red' }}>{formError}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="loginId">Login ID:</label>
          <input
            type="text"
            id="loginId"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder="e.g., 2023123456@student.annauniv.edu"
            required
            style={{ width: '100%', padding: '8px', margin: '5px 0 10px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="captcha">Enter CAPTCHA:</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '5px 0' }}>
            <span
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
          
                fontFamily: 'monospace',
                fontSize: '1.2em',
                letterSpacing: '2px',
                userSelect: 'none'
              }}
              title="CAPTCHA Text (this is NOT secure in a real app)"
            >
              {captchaText || 'Loading...'}
            </span>
            <button type="button" onClick={loadCaptcha} disabled={loading} style={{ padding: '8px' }}>
              Refresh
            </button>
          </div>
          <input
            type="text"
            id="userCaptchaInput"
            value={userCaptchaInput}
            onChange={(e) => setUserCaptchaInput(e.target.value)}
            maxLength="6"
            required
            style={{ width: '100%', padding: '8px' }}
          />
          <small>CAPTCHA is case-insensitive.</small>
        </div>

        <button type="submit" disabled={loading || !captchaText} style={{ padding: '10px 15px', width: '100%' }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p style={{marginTop: '10px', fontSize: '0.8em', color: 'orange'}}>
        <strong>Warning:</strong> The CAPTCHA displayed is for demonstration only and is not secure.
      </p>
    </div>
  );
};

export default LoginPage;