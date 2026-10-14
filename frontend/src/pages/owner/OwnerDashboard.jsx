import { useEffect, useState } from 'react';
import { ownerApi, getErrorMessage } from '../../services/api';
import Alert from '../../components/Alert';
import DataTable from '../../components/DataTable';
import StarRating from '../../components/StarRating';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await ownerApi.dashboard();
        if (!cancelled) setData(res.data.data);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const columns = [
    { key: 'user', label: 'User', render: (row) => row.user.name },
    { key: 'email', label: 'Email', render: (row) => row.user.email },
    { key: 'address', label: 'Address', render: (row) => row.user.address },
    {
      key: 'rating',
      label: 'Rating',
      render: (row) => (
        <span className="rating-inline">
          <StarRating value={row.rating} readOnly size="sm" />
          <span>{row.rating}</span>
        </span>
      ),
    },
    {
      key: 'updatedAt',
      label: 'Updated',
      render: (row) => new Date(row.updatedAt).toLocaleString(),
    },
  ];

  return (
    <div className="page">
      <header className="page-header">
        <h2>Store owner dashboard</h2>
        <p>Your store performance and customer ratings.</p>
      </header>

      <Alert type="error">{error}</Alert>

      {loading ? (
        <div className="spinner" />
      ) : data ? (
        <>
          <div className="stat-grid">
            <article className="stat-card">
              <span className="stat-label">Store</span>
              <strong className="stat-value text-sm">{data.store.name}</strong>
            </article>
            <article className="stat-card">
              <span className="stat-label">Average rating</span>
              <strong className="stat-value">{data.averageRating}</strong>
              <StarRating value={Math.round(data.averageRating)} readOnly />
            </article>
            <article className="stat-card">
              <span className="stat-label">Total ratings</span>
              <strong className="stat-value">{data.ratingCount}</strong>
            </article>
          </div>

          <section className="panel">
            <h3>Customers who rated your store</h3>
            <p className="muted">{data.store.address}</p>
            <DataTable
              columns={columns}
              rows={data.ratings}
              emptyMessage="No ratings submitted for your store yet."
            />
          </section>
        </>
      ) : null}
    </div>
  );
}
