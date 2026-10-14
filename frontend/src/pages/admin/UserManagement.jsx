import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, getErrorMessage } from '../../services/api';
import {
  validateAddress,
  validateEmail,
  validateName,
  validatePassword,
  validateRequired,
  LIMITS,
} from '../../utils/validation';
import Alert from '../../components/Alert';
import DataTable from '../../components/DataTable';

const emptyForm = {
  name: '',
  email: '',
  address: '',
  password: '',
  role: 'user',
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.listUsers({
        ...filters,
        role: filters.role || undefined,
        sortBy,
        sortOrder,
      });
      setUsers(res.data.data.users);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, sortOrder]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function onFilterChange(e) {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function onSort(key) {
    if (sortBy === key) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  }

  function onFormChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  }

  function validateForm() {
    const next = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
      password: validatePassword(form.password),
      role: validateRequired(form.role, 'Role'),
    };
    setFormErrors(next);
    return !Object.values(next).some(Boolean);
  }

  async function onCreate(e) {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await adminApi.createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        password: form.password,
        role: form.role,
      });
      setSuccess('User created successfully.');
      setForm(emptyForm);
      setShowForm(false);
      await loadUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const columns = [
    { key: 'name', label: 'Name', sortKey: 'name' },
    { key: 'email', label: 'Email', sortKey: 'email' },
    { key: 'address', label: 'Address', sortKey: 'address' },
    {
      key: 'role',
      label: 'Role',
      sortKey: 'role',
      render: (row) => <span className={`badge badge-${row.role}`}>{row.role}</span>,
    },
    {
      key: 'actions',
      label: 'Details',
      render: (row) => (
        <Link className="link" to={`/admin/users/${row.id}`}>
          View
        </Link>
      ),
    },
  ];

  return (
    <div className="page">
      <header className="page-header row-between">
        <div>
          <h2>User management</h2>
          <p>Search, filter, and create users, administrators, and store owners.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Close form' : 'Add user'}
        </button>
      </header>

      <Alert type="error" onClose={() => setError('')}>
        {error}
      </Alert>
      <Alert type="success" onClose={() => setSuccess('')}>
        {success}
      </Alert>

      {showForm && (
        <form className="panel form-panel" onSubmit={onCreate} noValidate>
          <h3>Create account</h3>
          <div className="form-grid">
            <label>
              Name ({LIMITS.NAME_MIN}–{LIMITS.NAME_MAX})
              <input name="name" value={form.name} onChange={onFormChange} maxLength={LIMITS.NAME_MAX} />
              {formErrors.name && <span className="field-error">{formErrors.name}</span>}
            </label>
            <label>
              Email
              <input type="email" name="email" value={form.email} onChange={onFormChange} />
              {formErrors.email && <span className="field-error">{formErrors.email}</span>}
            </label>
            <label>
              Role
              <select name="role" value={form.role} onChange={onFormChange}>
                <option value="user">Normal User</option>
                <option value="admin">Administrator</option>
                <option value="store_owner">Store Owner</option>
              </select>
              {formErrors.role && <span className="field-error">{formErrors.role}</span>}
            </label>
            <label>
              Password
              <input type="password" name="password" value={form.password} onChange={onFormChange} />
              {formErrors.password && <span className="field-error">{formErrors.password}</span>}
            </label>
            <label className="full">
              Address
              <textarea name="address" rows={2} value={form.address} onChange={onFormChange} maxLength={LIMITS.ADDRESS_MAX} />
              {formErrors.address && <span className="field-error">{formErrors.address}</span>}
            </label>
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create user'}
          </button>
        </form>
      )}

      <div className="panel filters">
        <input name="name" placeholder="Filter by name" value={filters.name} onChange={onFilterChange} />
        <input name="email" placeholder="Filter by email" value={filters.email} onChange={onFilterChange} />
        <input name="address" placeholder="Filter by address" value={filters.address} onChange={onFilterChange} />
        <select name="role" value={filters.role} onChange={onFilterChange}>
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="store_owner">Store Owner</option>
        </select>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : (
        <DataTable
          columns={columns}
          rows={users}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={onSort}
          emptyMessage="No users match your filters."
        />
      )}
    </div>
  );
}
