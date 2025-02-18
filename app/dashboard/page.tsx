// app/dashboard/page.tsx
'use client';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>{user ? `Dashboard (${user.role})` : 'Dashboard'}</h1>
      {user && <p>Welcome, {user.username}!</p>}
      <button onClick={logout}>Logout</button>
      {user?.role === 'admin' && <div>Admin Panel</div>}
      {user?.role === 'staff' && <div>Staff Dashboard</div>}
      {user?.role === 'user' && <div>User Dashboard</div>}
    </div>
  );
}
