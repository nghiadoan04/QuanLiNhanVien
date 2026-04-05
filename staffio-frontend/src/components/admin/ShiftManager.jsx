import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import Loading from '../common/Loading';

export default function ShiftManager() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editShift, setEditShift] = useState(null);
  const [expandedShift, setExpandedShift] = useState(null);
  const [registrations, setRegistrations] = useState([]);

  // Shift form state
  const [form, setForm] = useState({
    name: '',
    date: '',
    startTime: '',
    endTime: '',
    maxEmployees: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Default: current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setDateFrom(firstDay.toISOString().split('T')[0]);
    setDateTo(lastDay.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (dateFrom && dateTo) fetchShifts();
  }, [dateFrom, dateTo]);

  const fetchShifts = async () => {
    try {
      const res = await api.get('/admin/shifts', {
        params: { from: dateFrom, to: dateTo },
      });
      setShifts(res.data || []);
    } catch {
      toast.error('Lỗi tải danh sách ca');
      setShifts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async (shiftId) => {
    try {
      const res = await api.get(`/admin/shifts/${shiftId}/registrations`);
      setRegistrations(res.data || []);
    } catch {
      setRegistrations([]);
    }
  };

  const toggleExpand = (shiftId) => {
    if (expandedShift === shiftId) {
      setExpandedShift(null);
      setRegistrations([]);
    } else {
      setExpandedShift(shiftId);
      fetchRegistrations(shiftId);
    }
  };

  const openAdd = () => {
    setEditShift(null);
    setForm({ name: '', date: '', startTime: '', endTime: '', maxEmployees: '' });
    setShowModal(true);
  };

  const openEdit = (shift) => {
    setEditShift(shift);
    setForm({
      name: shift.name,
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      maxEmployees: shift.maxEmployees,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.date || !form.startTime || !form.endTime || !form.maxEmployees) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setSubmitting(true);
    try {
      if (editShift) {
        await api.put(`/admin/shifts/${editShift.id}`, {
          ...form,
          maxEmployees: Number(form.maxEmployees),
        });
        toast.success('Cập nhật ca thành công');
      } else {
        await api.post('/admin/shifts', {
          ...form,
          maxEmployees: Number(form.maxEmployees),
        });
        toast.success('Tạo ca mới thành công');
      }
      setShowModal(false);
      fetchShifts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa ca này?')) return;
    try {
      await api.delete(`/admin/shifts/${id}`);
      toast.success('Xóa ca thành công');
      fetchShifts();
    } catch {
      toast.error('Lỗi khi xóa ca');
    }
  };

  const handleApproveReg = async (regId) => {
    try {
      await api.put(`/admin/registrations/${regId}/approve`);
      toast.success('Đã duyệt');
      if (expandedShift) fetchRegistrations(expandedShift);
      fetchShifts();
    } catch {
      toast.error('Lỗi khi duyệt');
    }
  };

  const handleRejectReg = async (regId) => {
    try {
      await api.put(`/admin/registrations/${regId}/reject`);
      toast.success('Đã từ chối');
      if (expandedShift) fetchRegistrations(expandedShift);
      fetchShifts();
    } catch {
      toast.error('Lỗi khi từ chối');
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h4 className="fw-bold mb-0">Quản lý ca làm việc</h4>
        <button className="btn btn-primary" onClick={openAdd}>
          <i className="bi bi-plus-lg me-1"></i>Tạo ca mới
        </button>
      </div>

      {/* Date filter */}
      <div className="card mb-3">
        <div className="card-body py-2">
          <div className="row g-2 align-items-center">
            <div className="col-auto">
              <label className="form-label mb-0 text-muted" style={{ fontSize: '0.85rem' }}>Từ:</label>
            </div>
            <div className="col-auto">
              <input
                type="date"
                className="form-control form-control-sm"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="col-auto">
              <label className="form-label mb-0 text-muted" style={{ fontSize: '0.85rem' }}>Đến:</label>
            </div>
            <div className="col-auto">
              <input
                type="date"
                className="form-control form-control-sm"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Shift table */}
      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th></th>
                  <th>Tên ca</th>
                  <th>Ngày</th>
                  <th>Giờ bắt đầu</th>
                  <th>Giờ kết thúc</th>
                  <th>Đăng ký</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {shifts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      Không có ca nào trong khoảng thời gian này
                    </td>
                  </tr>
                ) : (
                  shifts.map((shift) => (
                    <>
                      <tr key={shift.id}>
                        <td>
                          <button
                            className="btn btn-sm btn-link p-0"
                            onClick={() => toggleExpand(shift.id)}
                          >
                            <i className={`bi ${expandedShift === shift.id ? 'bi-chevron-down' : 'bi-chevron-right'}`}></i>
                          </button>
                        </td>
                        <td className="fw-medium">{shift.name}</td>
                        <td>{shift.date}</td>
                        <td>{shift.startTime}</td>
                        <td>{shift.endTime}</td>
                        <td>
                          <span className={shift.registeredCount >= shift.maxEmployees ? 'text-danger' : 'text-success'}>
                            {shift.registeredCount || 0}/{shift.maxEmployees}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-1"
                            onClick={() => openEdit(shift)}
                            title="Sửa"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(shift.id)}
                            title="Xóa"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                      {expandedShift === shift.id && (
                        <tr key={`reg-${shift.id}`}>
                          <td colSpan="7" className="bg-light">
                            <div className="p-2">
                              <h6 className="fw-semibold mb-2">Danh sách đăng ký</h6>
                              {registrations.length === 0 ? (
                                <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                                  Chưa có đăng ký nào
                                </p>
                              ) : (
                                <table className="table table-sm mb-0">
                                  <thead>
                                    <tr>
                                      <th>Nhân viên</th>
                                      <th>Trạng thái</th>
                                      <th>Hành động</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {registrations.map((reg) => (
                                      <tr key={reg.id}>
                                        <td>{reg.employeeName}</td>
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
                                            <>
                                              <button
                                                className="btn btn-sm btn-outline-success me-1"
                                                onClick={() => handleApproveReg(reg.id)}
                                              >
                                                Duyệt
                                              </button>
                                              <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleRejectReg(reg.id)}
                                              >
                                                Từ chối
                                              </button>
                                            </>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Shift Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0" style={{ borderRadius: 12 }}>
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-semibold">
                  {editShift ? 'Sửa ca làm' : 'Tạo ca mới'}
                </h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Tên ca <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="VD: Ca sáng"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Ngày <span className="text-danger">*</span></label>
                    <input
                      type="date"
                      className="form-control"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label">Giờ bắt đầu <span className="text-danger">*</span></label>
                      <input
                        type="time"
                        className="form-control"
                        value={form.startTime}
                        onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Giờ kết thúc <span className="text-danger">*</span></label>
                      <input
                        type="time"
                        className="form-control"
                        value={form.endTime}
                        onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Số nhân viên tối đa <span className="text-danger">*</span></label>
                    <input
                      type="number"
                      className="form-control"
                      value={form.maxEmployees}
                      onChange={(e) => setForm({ ...form, maxEmployees: e.target.value })}
                      min="1"
                      placeholder="5"
                    />
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? (
                      <><span className="spinner-border spinner-border-sm me-1" />Đang lưu...</>
                    ) : (
                      editShift ? 'Cập nhật' : 'Tạo ca'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
