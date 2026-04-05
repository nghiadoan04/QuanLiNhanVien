import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function EmployeeLayout() {
  const { logout, user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div>
      <nav className="employee-navbar navbar navbar-expand-md sticky-top">
        <div className="container">
          <NavLink to="/employee" className="navbar-brand fw-bold" style={{ color: 'var(--primary)' }}>
            <i className="bi bi-people-fill me-2"></i>Staffio
          </NavLink>

          <button
            className="navbar-toggler border-0"
            type="button"
            onClick={() => setNavOpen(!navOpen)}
          >
            <i className="bi bi-list fs-4"></i>
          </button>

          <div className={`collapse navbar-collapse ${navOpen ? 'show' : ''}`}>
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <NavLink
                  to="/employee"
                  end
                  className={({ isActive }) => `nav-link ${isActive ? 'fw-semibold' : ''}`}
                  style={({ isActive }) => isActive ? { color: 'var(--primary)' } : {}}
                  onClick={() => setNavOpen(false)}
                >
                  Trang chủ
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/employee/shifts"
                  className={({ isActive }) => `nav-link ${isActive ? 'fw-semibold' : ''}`}
                  style={({ isActive }) => isActive ? { color: 'var(--primary)' } : {}}
                  onClick={() => setNavOpen(false)}
                >
                  Đăng ký ca
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/employee/schedule"
                  className={({ isActive }) => `nav-link ${isActive ? 'fw-semibold' : ''}`}
                  style={({ isActive }) => isActive ? { color: 'var(--primary)' } : {}}
                  onClick={() => setNavOpen(false)}
                >
                  Lịch làm
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/employee/scan"
                  className={({ isActive }) => `nav-link ${isActive ? 'fw-semibold' : ''}`}
                  style={({ isActive }) => isActive ? { color: 'var(--primary)' } : {}}
                  onClick={() => setNavOpen(false)}
                >
                  Quét QR
                </NavLink>
              </li>
            </ul>

            <ul className="navbar-nav">
              <li className="nav-item dropdown">
                <button
                  className="btn nav-link dropdown-toggle d-flex align-items-center gap-1"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: 28,
                      height: 28,
                      background: '#eef0fb',
                      color: 'var(--primary)',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                    }}
                  >
                    {user?.fullName?.charAt(0) || 'N'}
                  </div>
                  <span style={{ fontSize: '0.9rem' }}>{user?.fullName || 'Nhân viên'}</span>
                </button>
                <ul className={`dropdown-menu dropdown-menu-end ${dropdownOpen ? 'show' : ''}`}>
                  <li>
                    <NavLink
                      to="/employee/profile"
                      className="dropdown-item"
                      onClick={() => { setDropdownOpen(false); setNavOpen(false); }}
                    >
                      <i className="bi bi-person me-2"></i>Hồ sơ
                    </NavLink>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" onClick={logout}>
                      <i className="bi bi-box-arrow-left me-2"></i>Đăng xuất
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <main className="container py-4">
        <Outlet />
      </main>
    </div>
  );
}
