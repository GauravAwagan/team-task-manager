import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post(`${API}/api/auth/login`, {
        email,
        password
      });

      login(res.data.token, res.data.user);
      navigate('/dashboard');

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Welcome Back
        </h2>

        {error && (
          <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />

          <button type="submit">
            Sign In
          </button>
        </form>

        <div>
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;