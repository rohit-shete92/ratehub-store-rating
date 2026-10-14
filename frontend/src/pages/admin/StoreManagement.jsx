import { useCallback, useEffect, useState } from 'react';
import { adminApi, getErrorMessage } from '../../services/api';
import {
  validateAddress,
  validateEmail,
  validateName,
  LIMITS,
} from '../../utils/validation';
import Alert from '../../components/Alert';
import DataTable from '../../components/DataTable';
import StarRating from '../../components/StarRating';

const emptyForm = { name: '', email: '', address: '', ownerId: '' };

export default function StoreManagement() {
  const [stores, setStores] = useState([]);
  const [owners, setOwners] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loadStores = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.listStores({ ...filters, sortBy, sortOrder });
      setStores(res.data.data.stores);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, sortOrder]);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  useEffect(() => {
    async function loadOwners() {
      try {
        const res = await adminApi.listUsers({ role: 'store_owner', sortBy: 'name', sortOrder: 'asc' });
        setOwners(res.data.data.users);
      } catch {
        /* optional for owner dropdown */
      }
    }
    loadOwners();
  }, []);

  function onFilterChange(e) {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function onSort(key) {
    if (sortBy === key) setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else {
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
      await adminApi.createStore({
        name: form.name.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        ownerId: form.ownerId ? Number(form.ownerId) : null,
      });
      setSuccess('Store created successfully.');
      setForm(emptyForm);
      setShowForm(false);
      await loadStores();
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
      key: 'averageRating',
      label: 'Avg rating',
      sortKey: 'average_rating',
      render: (row) => (
        <span className="rating-inline">
          <StarRating value={Math.round(row.averageRating)} readOnly size="sm" />
          <span>{row.averageRating}</span>
        </span>
      ),
    },
    {
      key: 'owner',
      label: 'Owner',
      render: (row) => row.ownerName || '—',
    },
  ];

  return (
    <div className="page">
      <header className="page-header row-between">
        <div>
          <h2>Store management</h2>
          <p>Add stores and review average ratings across the platform.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Close form' : 'Add store'}
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
          <h3>Create store</h3>
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
              Owner (optional)
              <select name="ownerId" value={form.ownerId} onChange={onFormChange}>
                <option value="">No owner assigned</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({o.email})
                  </option>
                ))}
              </select>
            </label>
            <label className="full">
              Address
              <textarea name="address" rows={2} value={form.address} onChange={onFormChange} maxLength={LIMITS.ADDRESS_MAX} />
              {formErrors.address && <span className="field-error">{formErrors.address}</span>}
            </label>
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create store'}
          </button>
        </form>
      )}

      <div className="panel filters">
        <input name="name" placeholder="Filter by name" value={filters.name} onChange={onFilterChange} />
        <input name="email" placeholder="Filter by email" value={filters.email} onChange={onFilterChange} />
        <input name="address" placeholder="Filter by address" value={filters.address} onChange={onFilterChange} />
      </div>

      {loading ? (
        <div className="spinner" />
      ) : (
        <DataTable
          columns={columns}
          rows={stores}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={onSort}
          emptyMessage="No stores match your filters."
        />
      )}
    </div>
  );
}
