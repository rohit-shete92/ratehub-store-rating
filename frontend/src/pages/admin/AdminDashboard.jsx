import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, getErrorMessage } from '../../services/api';
import Alert from '../../components/Alert';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await adminApi.dashboard();
        if (!cancelled) setStats(res.data.data);
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

  return (
    <div className="page">
      <header className="page-header">
        <h2>Administrator dashboard</h2>
        <p>Platform overview and quick actions.</p>
      </header>

      <Alert type="error">{error}</Alert>

      {loading ? (
        <div className="spinner" />
      ) : (
        stats && (
          <div className="stat-grid">
            <article className="stat-card">
              <span className="stat-label">Total users</span>
              <strong className="stat-value">{stats.totalUsers}</strong>
            </article>
            <article className="stat-card">
              <span className="stat-label">Total stores</span>
              <strong className="stat-value">{stats.totalStores}</strong>
            </article>
            <article className="stat-card">
              <span className="stat-label">Total ratings</span>
              <strong className="stat-value">{stats.totalRatings}</strong>
            </article>
          </div>
        )
      )}

      <div className="action-row">
        <Link className="btn btn-primary" to="/admin/users">
          Manage users
        </Link>
        <Link className="btn btn-secondary" to="/admin/stores">
          Manage stores
        </Link>
      </div>
    </div>
  );
}
