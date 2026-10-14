import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validateRequired } from '../utils/validation';
import Alert from '../components/Alert';

function roleHome(role) {
  if (role === 'admin') return '/admin';
  if (role === 'store_owner') return '/owner';
  return '/stores';
}

export default function Login() {
  const { login, isAuthenticated, user, loading, getErrorMessage } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  function onChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  }

  function validate() {
    const next = {
      email: validateEmail(form.email),
      password: validateRequired(form.password, 'Password'),
    };
    setErrors(next);
    return !Object.values(next).some(Boolean);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      const loggedIn = await login(form.email, form.password);
      navigate(roleHome(loggedIn.role));
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-brand">
          <span className="brand-mark lg">RH</span>
          <h1>RateHub</h1>
          <p>Sign in to rate stores and manage your dashboard.</p>
        </div>

        <form className="auth-form card-form" onSubmit={onSubmit} noValidate>
          <h2>Welcome back</h2>
          <Alert type="error" onClose={() => setApiError('')}>
            {apiError}
          </Alert>

          <label>
            Email
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={onChange}
              placeholder="you@example.com"
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={form.password}
              onChange={onChange}
              placeholder="Your password"
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </label>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="auth-switch">
            New here? <Link to="/register">Create a normal user account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
