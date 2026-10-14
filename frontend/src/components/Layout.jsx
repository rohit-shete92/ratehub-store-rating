import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const roleLabel =
    user?.role === 'admin' ? 'Administrator' : user?.role === 'store_owner' ? 'Store Owner' : 'User';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">RH</span>
          <div>
            <strong>RateHub</strong>
            <small>Store Ratings</small>
          </div>
        </div>

        <nav className="nav">
          {user?.role === 'admin' && (
            <>
              <NavLink to="/admin" end>
                Dashboard
              </NavLink>
              <NavLink to="/admin/users">Users</NavLink>
              <NavLink to="/admin/stores">Stores</NavLink>
            </>
          )}
          {user?.role === 'user' && <NavLink to="/stores">Stores</NavLink>}
          {user?.role === 'store_owner' && <NavLink to="/owner">My Store</NavLink>}
          <NavLink to="/change-password">Password</NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <span className="user-chip-name">{user?.name}</span>
            <span className="user-chip-role">{roleLabel}</span>
          </div>
          <button type="button" className="btn btn-ghost btn-block" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">Signed in as</p>
            <h1 className="topbar-title">{user?.email}</h1>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
