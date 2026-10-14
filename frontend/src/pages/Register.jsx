import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  validateAddress,
  validateEmail,
  validateName,
  validatePassword,
  LIMITS,
} from '../utils/validation';
import Alert from '../components/Alert';

export default function Register() {
  const { register, isAuthenticated, user, loading, getErrorMessage } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    const dest = user.role === 'admin' ? '/admin' : user.role === 'store_owner' ? '/owner' : '/stores';
    return <Navigate to={dest} replace />;
  }

  function onChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  }

  function validate() {
    const next = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
      password: validatePassword(form.password),
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
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        password: form.password,
      });
      navigate('/stores');
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
          <p>Create a normal user account to discover and rate stores.</p>
        </div>

        <form className="auth-form card-form" onSubmit={onSubmit} noValidate>
          <h2>Create account</h2>
          <p className="muted small">
            Public registration always creates a Normal User. Admin and store owner accounts are
            created by administrators only.
          </p>
          <Alert type="error" onClose={() => setApiError('')}>
            {apiError}
          </Alert>

          <label>
            Full name ({LIMITS.NAME_MIN}–{LIMITS.NAME_MAX} characters)
            <input name="name" value={form.name} onChange={onChange} maxLength={LIMITS.NAME_MAX} />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </label>

          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={onChange} />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </label>

          <label>
            Address (max {LIMITS.ADDRESS_MAX} characters)
            <textarea
              name="address"
              rows={3}
              value={form.address}
              onChange={onChange}
              maxLength={LIMITS.ADDRESS_MAX}
            />
            {errors.address && <span className="field-error">{errors.address}</span>}
          </label>

          <label>
            Password (8–16 chars, upper, lower, digit, special)
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              autoComplete="new-password"
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </label>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Register'}
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
