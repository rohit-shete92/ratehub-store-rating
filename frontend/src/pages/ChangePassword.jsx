import { useState } from 'react';
import { authApi, getErrorMessage } from '../services/api';
import { validatePassword, validateRequired } from '../utils/validation';
import Alert from '../components/Alert';

export default function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function onChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  }

  function validate() {
    const next = {
      currentPassword: validateRequired(form.currentPassword, 'Current password'),
      newPassword: validatePassword(form.newPassword),
      confirmPassword: '',
    };
    if (form.newPassword && form.newPassword === form.currentPassword) {
      next.newPassword = 'New password must be different from current password';
    }
    if (form.newPassword !== form.confirmPassword) {
      next.confirmPassword = 'Passwords do not match';
    }
    setErrors(next);
    return !Object.values(next).some(Boolean);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setApiError('');
    setSuccess('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      await authApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess('Password updated successfully.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h2>Change password</h2>
        <p>Update your account password securely.</p>
      </header>

      <form className="panel form-panel" onSubmit={onSubmit} noValidate>
        <Alert type="error" onClose={() => setApiError('')}>
          {apiError}
        </Alert>
        <Alert type="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>

        <label>
          Current password
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={onChange}
            autoComplete="current-password"
          />
          {errors.currentPassword && <span className="field-error">{errors.currentPassword}</span>}
        </label>

        <label>
          New password
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={onChange}
            autoComplete="new-password"
          />
          {errors.newPassword && <span className="field-error">{errors.newPassword}</span>}
        </label>

        <label>
          Confirm new password
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={onChange}
            autoComplete="new-password"
          />
          {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
        </label>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
