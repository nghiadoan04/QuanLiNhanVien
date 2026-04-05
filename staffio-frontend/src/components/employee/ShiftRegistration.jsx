import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import Loading from '../common/Loading';

export default function ShiftRegistration() {
  const [availableShifts, setAvailableShifts] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [registeringId, setRegisteringId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [availRes, myRes] = await Promise.all([
        api.get('/employee/shifts/available'),
        api.get('/employee/registrations'),
      ]);
      setAvailableShifts(availRes.data || []);
      setMyRegistrations(myRes.data || []);
    } catch {
      toast.error('Lỗi tải dữ liệu');
      setAvailableShifts([]);
      setMyRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (shiftId) => {
    setRegisteringId(shiftId);
    try {
      await api.post(`/employee/shifts/${shiftId}/register`);
      toast.success('Đăng ký ca thành công, chờ phê duyệt');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi đăng ký ca');
    } finally {
      setRegisteringId(null);
    }
  };

  const handleCancel = async (registrationId) => {
    if (!window.confirm('Bạn có chắc muốn hủy đăng ký này?')) return;
    try {
      await api.delete(`/employee/registrations/${registrationId}`);
      toast.success('Đã hủy đăng ký');
      fetchData();
    } catch {
      toast.error('Lỗi hủy đăng ký');
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <h4 className="fw-bold mb-4">Đăng ký ca làm</h4>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'available' ? 'active' : ''}`}
            style={activeTab === 'available' ? { color: 'var(--primary)', borderBottomColor: 'var(--primary)' } : {}}
            onClick={() => setActiveTab('available')}
          >
            Ca còn trống
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'my' ? 'active' : ''}`}
            style={activeTab === 'my' ? { color: 'var(--primary)', borderBottomColor: 'var(--primary)' } : {}}
            onClick={() => setActiveTab('my')}
          >
            Đăng ký của tôi
            {myRegistrations.length > 0 && (
              <span className="badge ms-1" style={{ background: 'var(--primary)', fontSize: '0.7rem' }}>
                {myRegistrations.length}
              </span>
            )}
          </button>
        </li>
      </ul>

      {activeTab === 'available' && (
        <div>
          {availableShifts.length === 0 ? (
            <div className="card">
              <div className="card-body text-center text-muted py-4">
                Không có ca nào còn trống
              </div>
            </div>
          ) : (
            <div className="row g-3">
              {availableShifts.map((shift) => (
                <div className="col-md-6 col-xl-4" key={shift.id}>
                  <div className="card h-100">
                    <div className="card-body">
                      <h6 className="fw-semibold mb-2">{shift.name}</h6>
                      <div className="mb-1">
                        <i className="bi bi-calendar3 me-2 text-muted"></i>
                        <span>{shift.date}</span>
                      </div>
                      <div className="mb-1">
                        <i className="bi bi-clock me-2 text-muted"></i>
                        <span>{shift.startTime} - {shift.endTime}</span>
                      </div>
                      <div className="mb-3">
                        <i className="bi bi-people me-2 text-muted"></i>
                        <span>
                          Còn {shift.maxEmployees - (shift.registeredCount || 0)} / {shift.maxEmployees} chỗ
                        </span>
                      </div>
                      <button
                        className="btn btn-primary btn-sm w-100"
                        onClick={() => handleRegister(shift.id)}
                        disabled={registeringId === shift.id}
                      >
                        {registeringId === shift.id ? (
                          <><span className="spinner-border spinner-border-sm me-1" />Đang đăng ký...</>
                        ) : (
                          <><i className="bi bi-plus-circle me-1"></i>Đăng ký</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'my' && (
        <div className="card">
          <div className="card-body p-0">
            {myRegistrations.length === 0 ? (
              <p className="text-muted text-center py-4">Bạn chưa đăng ký ca nào</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Tên ca</th>
                      <th>Ngày</th>
                      <th>Giờ</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myRegistrations.map((reg) => (
                      <tr key={reg.id}>
                        <td className="fw-medium">{reg.shiftName}</td>
                        <td>{reg.shiftDate}</td>
                        <td>{reg.startTime} - {reg.endTime}</td>
                        <td>
                          <span
                            className={`badge ${
                              reg.status === 'APPROVED'
                                ? 'badge-approved'
                                : reg.status === 'REJECTED'
                                ? 'badge-rejected'
                                : 'badge-pending'
                            }`}
                          >
                            {reg.status === 'APPROVED'
                              ? 'Đã duyệt'
                              : reg.status === 'REJECTED'
                              ? 'Từ chối'
                              : 'Chờ duyệt'}
                          </span>
                        </td>
                        <td>
                          {reg.status === 'PENDING' && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleCancel(reg.id)}
                            >
                              Hủy
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
