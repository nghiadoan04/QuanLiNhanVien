import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { path: '/admin', icon: 'bi-grid', label: 'Dashboard', end: true },
  { path: '/admin/employees', icon: 'bi-people', label: 'Nhân viên' },
  { path: '/admin/shifts', icon: 'bi-calendar3', label: 'Ca làm việc' },
  { path: '/admin/attendance', icon: 'bi-qr-code', label: 'Chấm công' },
  { path: '/admin/statistics', icon: 'bi-bar-chart', label: 'Thống kê' },
];

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div>
      {/* Mobile topbar */}
      <div className="admin-topbar">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => setSidebarOpen(true)}
        >
          <i className="bi bi-list fs-5"></i>
        </button>
        <span className="fw-bold" style={{ color: 'var(--primary)' }}>Staffio</span>
        <span></span>
      </div>

      {/* Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <nav className={`admin-sidebar ${sidebarOpen ? 'show' : ''}`}>
        <div className="p-3 border-bottom">
          <h5 className="fw-bold mb-0" style={{ color: 'var(--primary)' }}>
            <i className="bi bi-people-fill me-2"></i>Staffio
          </h5>
          <small className="text-muted">Quản trị viên</small>
        </div>

        <ul className="nav flex-column mt-2">
          {menuItems.map((item) => (
            <li className="nav-item" key={item.path}>
              <NavLink
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : ''}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <i className={`bi ${item.icon}`}></i>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-auto p-3 border-top" style={{ position: 'absolute', bottom: 0, width: '100%' }}>
          <div className="d-flex align-items-center gap-2 mb-2 px-2">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: 36,
                height: 36,
                background: '#eef0fb',
                color: 'var(--primary)',
                fontWeight: 600,
              }}
            >
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div>
              <div className="fw-semibold" style={{ fontSize: '0.85rem' }}>
                {user?.fullName || 'Admin'}
              </div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>Quản trị viên</div>
            </div>
          </div>
          <button
            className="btn btn-outline-secondary btn-sm w-100"
            onClick={logout}
          >
            <i className="bi bi-box-arrow-left me-1"></i>Đăng xuất
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
