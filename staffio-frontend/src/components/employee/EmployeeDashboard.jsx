import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import Loading from '../common/Loading';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [upcomingShifts, setUpcomingShifts] = useState([]);
  const [stats, setStats] = useState({ totalHours: 0, totalShifts: 0 });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [shiftsRes, statsRes, notiRes] = await Promise.all([
        api.get('/employee/shifts/upcoming'),
        api.get('/employee/statistics/summary'),
        api.get('/employee/notifications/recent'),
      ]);
      setUpcomingShifts(shiftsRes.data || []);
      setStats(statsRes.data || { totalHours: 0, totalShifts: 0 });
      setNotifications(notiRes.data || []);
    } catch {
      setUpcomingShifts([]);
      setStats({ totalHours: 0, totalShifts: 0 });
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      {/* Greeting */}
      <div className="mb-4">
        <h4 className="fw-bold">
          Xin chào, {user?.fullName || 'Nhân viên'}!
        </h4>
        <p className="text-muted mb-0">Chúc bạn một ngày làm việc hiệu quả</p>
      </div>

      {/* Quick stats */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>Giờ làm tháng này</div>
                <div className="fw-bold fs-4 mt-1">{stats.totalHours || 0}h</div>
              </div>
              <i className="bi bi-clock fs-3 text-muted"></i>
            </div>
          </div>
        </div>
        <div className="col-sm-6">
          <div className="stat-card success">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>Số ca đã làm</div>
                <div className="fw-bold fs-4 mt-1">{stats.totalShifts || 0}</div>
              </div>
              <i className="bi bi-calendar-check fs-3 text-muted"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {/* Upcoming shifts */}
        <div className="col-lg-7">
          <div className="card">
            <div className="card-header bg-white border-bottom">
              <h6 className="mb-0 fw-semibold">
                <i className="bi bi-calendar-event me-2"></i>Ca làm sắp tới
              </h6>
            </div>
            <div className="card-body p-0">
              {upcomingShifts.length === 0 ? (
                <p className="text-muted text-center py-4">Không có ca sắp tới</p>
              ) : (
                <div className="list-group list-group-flush">
                  {upcomingShifts.slice(0, 3).map((shift, idx) => (
                    <div className="list-group-item" key={idx}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-medium">{shift.shiftName || shift.name}</div>
                          <small className="text-muted">
                            <i className="bi bi-calendar3 me-1"></i>
                            {shift.shiftDate || shift.date}
                          </small>
                        </div>
                        <div className="text-end">
                          <div style={{ color: 'var(--primary)', fontWeight: 500 }}>
                            {shift.startTime} - {shift.endTime}
                          </div>
                          <span className="badge badge-approved">Đã duyệt</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="col-lg-5">
          <div className="card">
            <div className="card-header bg-white border-bottom">
              <h6 className="mb-0 fw-semibold">
                <i className="bi bi-bell me-2"></i>Thông báo mới
              </h6>
            </div>
            <div className="card-body p-0">
              {notifications.length === 0 ? (
                <p className="text-muted text-center py-4">Không có thông báo mới</p>
              ) : (
                <div className="list-group list-group-flush">
                  {notifications.slice(0, 5).map((noti, idx) => (
                    <div className="list-group-item" key={idx}>
                      <div className="fw-medium" style={{ fontSize: '0.9rem' }}>
                        {noti.title || noti.message}
                      </div>
                      <small className="text-muted">{noti.createdAt || noti.time}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
