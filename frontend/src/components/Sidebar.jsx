import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span style={{ color: 'var(--primary)' }}>Team</span>Task
      </div>
      
      <div style={{ padding: '0 1.5rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Welcome,</div>
        <div style={{ fontWeight: '600' }}>{user?.name}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.25rem' }}>{user?.role}</div>
      </div>

      <ul className="nav-links">
        <li className="nav-item">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/projects" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FolderKanban size={20} />
            Projects
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/tasks" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <CheckSquare size={20} />
            Tasks
          </NavLink>
        </li>
      </ul>
      
      <div style={{ marginTop: 'auto', padding: '1.5rem' }}>
        <button onClick={logout} className="btn btn-outline" style={{ width: '100%' }}>
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
