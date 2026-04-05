import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Loading from '../common/Loading';
import { toast } from 'react-toastify';

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [todayShifts, setTodayShifts] = useState([]);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [overviewRes, todayRes, pendingRes] = await Promise.all([
        api.get('/admin/statistics/overview'),
        api.get('/admin/shifts/today'),
        api.get('/admin/registrations/pending'),
      ]);
      setOverview(overviewRes.data);
      setTodayShifts(todayRes.data || []);
      setPendingRegistrations(pendingRes.data || []);
    } catch (err) {
      console.error(err);
      // Set default values on error
      setOverview({
        totalEmployees: 0,
        totalShiftsThisMonth: 0,
        totalHoursThisMonth: 0,
        totalSalaryThisMonth: 0,
      });
      setTodayShifts([]);
      setPendingRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (registrationId) => {
    try {
      await api.put(`/admin/registrations/${registrationId}/approve`);
      toast.success('Đã duyệt đăng ký');
      fetchData();
    } catch {
      toast.error('Lỗi khi duyệt đăng ký');
    }
  };

  const handleReject = async (registrationId) => {
    try {
      await api.put(`/admin/registrations/${registrationId}/reject`);
      toast.success('Đã từ chối đăng ký');
      fetchData();
    } catch {
      toast.error('Lỗi khi từ chối đăng ký');
    }
  };

  if (loading) return <Loading />;

  const stats = [
    {
      label: 'Tổng nhân viên',
      value: overview?.totalEmployees || 0,
      icon: 'bi-people',
      variant: '',
    },
    {
      label: 'Tổng ca tháng này',
      value: overview?.totalShiftsThisMonth || 0,
      icon: 'bi-calendar-check',
      variant: 'success',
    },
    {
      label: 'Tổng giờ làm',
      value: `${overview?.totalHoursThisMonth || 0}h`,
      icon: 'bi-clock',
      variant: 'warning',
    },
    {
      label: 'Tổng chi lương',
      value: `${(overview?.totalSalaryThisMonth || 0).toLocaleString('vi-VN')}đ`,
      icon: 'bi-cash-stack',
      variant: 'danger',
    },
  ];

  return (
    <div>
      <h4 className="fw-bold mb-4">Dashboard</h4>

      {/* Stat cards */}
      <div className="row g-3 mb-4">
        {stats.map((s, i) => (
          <div className="col-sm-6 col-xl-3" key={i}>
            <div className={`stat-card ${s.variant}`}>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted" style={{ fontSize: '0.85rem' }}>{s.label}</div>
                  <div className="fw-bold fs-4 mt-1">{s.value}</div>
                </div>
                <i className={`bi ${s.icon} fs-3 text-muted`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Today shifts */}
      <div className="row g-3">
        <div className="col-lg-7">
          <div className="card">
            <div className="card-header bg-white border-bottom">
              <h6 className="mb-0 fw-semibold">
                <i className="bi bi-calendar-day me-2"></i>Ca làm hôm nay
              </h6>
            </div>
            <div className="card-body p-0">
              {todayShifts.length === 0 ? (
                <p className="text-muted text-center py-4">Không có ca làm hôm nay</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Tên ca</th>
                        <th>Giờ</th>
                        <th>Số đăng ký</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayShifts.map((shift) => (
                        <tr key={shift.id}>
                          <td className="fw-medium">{shift.name}</td>
                          <td>{shift.startTime} - {shift.endTime}</td>
                          <td>{shift.registeredCount}/{shift.maxEmployees}</td>
                          <td>
                            <span className={`badge ${shift.registeredCount >= shift.maxEmployees ? 'badge-rejected' : 'badge-approved'}`}>
                              {shift.registeredCount >= shift.maxEmployees ? 'Đầy' : 'Còn chỗ'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pending registrations */}
        <div className="col-lg-5">
          <div className="card">
            <div className="card-header bg-white border-bottom">
              <h6 className="mb-0 fw-semibold">
                <i className="bi bi-hourglass-split me-2"></i>Đăng ký chờ duyệt
              </h6>
            </div>
            <div className="card-body p-0">
              {pendingRegistrations.length === 0 ? (
                <p className="text-muted text-center py-4">Không có đăng ký chờ duyệt</p>
              ) : (
                <div className="list-group list-group-flush">
                  {pendingRegistrations.slice(0, 5).map((reg) => (
                    <div className="list-group-item" key={reg.id}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="fw-medium">{reg.employeeName}</div>
                          <small className="text-muted">
                            {reg.shiftName} - {reg.shiftDate}
                          </small>
                        </div>
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleApprove(reg.id)}
                            title="Duyệt"
                          >
                            <i className="bi bi-check-lg"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleReject(reg.id)}
                            title="Từ chối"
                          >
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </div>
                      </div>
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
