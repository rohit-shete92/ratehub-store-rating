import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminApi, getErrorMessage } from '../../services/api';
import Alert from '../../components/Alert';
import StarRating from '../../components/StarRating';

export default function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await adminApi.getUser(id);
        if (!cancelled) setUser(res.data.data.user);
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
  }, [id]);

  return (
    <div className="page">
      <header className="page-header row-between">
        <div>
          <h2>User details</h2>
          <p>Profile and related activity.</p>
        </div>
        <Link className="btn btn-ghost" to="/admin/users">
          Back to users
        </Link>
      </header>

      <Alert type="error">{error}</Alert>

      {loading ? (
        <div className="spinner" />
      ) : user ? (
        <div className="detail-grid">
          <section className="panel">
            <h3>{user.name}</h3>
            <dl className="detail-list">
              <div>
                <dt>Email</dt>
                <dd>{user.email}</dd>
              </div>
              <div>
                <dt>Address</dt>
                <dd>{user.address}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>
                  <span className={`badge badge-${user.role}`}>{user.role}</span>
                </dd>
              </div>
              <div>
                <dt>Ratings submitted</dt>
                <dd>{user.ratingCount}</dd>
              </div>
              <div>
                <dt>Average rating given</dt>
                <dd>{user.averageRatingGiven}</dd>
              </div>
            </dl>
          </section>

          {user.ownedStore && (
            <section className="panel">
              <h3>Owned store</h3>
              <dl className="detail-list">
                <div>
                  <dt>Name</dt>
                  <dd>{user.ownedStore.name}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{user.ownedStore.email}</dd>
                </div>
                <div>
                  <dt>Address</dt>
                  <dd>{user.ownedStore.address}</dd>
                </div>
                <div>
                  <dt>Average rating</dt>
                  <dd className="rating-inline">
                    <StarRating value={Math.round(user.ownedStore.averageRating)} readOnly />
                    <span>{user.ownedStore.averageRating} ({user.ownedStore.ratingCount} ratings)</span>
                  </dd>
                </div>
              </dl>
            </section>
          )}
        </div>
      ) : null}
    </div>
  );
}
