import { useCallback, useEffect, useState } from 'react';
import { storeApi, getErrorMessage } from '../../services/api';
import { validateRating } from '../../utils/validation';
import Alert from '../../components/Alert';
import StarRating from '../../components/StarRating';

export default function StoreList() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pending, setPending] = useState({});

  const loadStores = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await storeApi.list({
        name: filters.name || undefined,
        address: filters.address || undefined,
        sortBy,
        sortOrder,
      });
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

  function onFilterChange(e) {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleRate(storeId, rating) {
    const msg = validateRating(rating);
    if (msg) {
      setError(msg);
      return;
    }
    setPending((p) => ({ ...p, [storeId]: true }));
    setError('');
    setSuccess('');
    try {
      const res = await storeApi.rate(storeId, rating);
      const updated = res.data.data.rating;
      setStores((prev) =>
        prev.map((s) =>
          s.id === storeId
            ? {
                ...s,
                userRating: updated.rating,
                averageRating: updated.store.averageRating,
                ratingCount: updated.store.ratingCount,
              }
            : s
        )
      );
      setSuccess(updated.updated ? 'Rating updated.' : 'Rating submitted.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPending((p) => ({ ...p, [storeId]: false }));
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h2>Browse stores</h2>
        <p>Search stores and submit or update your 1–5 star rating.</p>
      </header>

      <Alert type="error" onClose={() => setError('')}>
        {error}
      </Alert>
      <Alert type="success" onClose={() => setSuccess('')}>
        {success}
      </Alert>

      <div className="panel filters">
        <input name="name" placeholder="Search by name" value={filters.name} onChange={onFilterChange} />
        <input
          name="address"
          placeholder="Search by address"
          value={filters.address}
          onChange={onFilterChange}
        />
        <select value={`${sortBy}:${sortOrder}`} onChange={(e) => {
          const [sb, so] = e.target.value.split(':');
          setSortBy(sb);
          setSortOrder(so);
        }}>
          <option value="name:asc">Name A–Z</option>
          <option value="name:desc">Name Z–A</option>
          <option value="average_rating:desc">Highest rated</option>
          <option value="average_rating:asc">Lowest rated</option>
          <option value="address:asc">Address A–Z</option>
        </select>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : stores.length === 0 ? (
        <div className="empty-state">No stores found. Try adjusting your search.</div>
      ) : (
        <div className="store-grid">
          {stores.map((store) => (
            <article key={store.id} className="store-card">
              <div className="store-card-head">
                <h3>{store.name}</h3>
                <div className="rating-inline">
                  <StarRating value={Math.round(store.averageRating)} readOnly size="sm" />
                  <span>
                    {store.averageRating}
                    <small> ({store.ratingCount})</small>
                  </span>
                </div>
              </div>
              <p className="store-address">{store.address}</p>
              <div className="store-rate">
                <span className="muted small">
                  Your rating: {store.userRating ? `${store.userRating}★` : 'Not rated yet'}
                </span>
                <StarRating
                  value={store.userRating || 0}
                  onChange={(r) => handleRate(store.id, r)}
                  readOnly={Boolean(pending[store.id])}
                />
                {pending[store.id] && <span className="muted small">Saving…</span>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
