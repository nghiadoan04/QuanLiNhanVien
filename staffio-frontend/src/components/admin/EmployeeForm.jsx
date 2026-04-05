import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

export default function EmployeeForm({ show, onClose, employee, onSaved }) {
  const isEdit = !!employee;
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    hourlyRate: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (employee) {
      setForm({
        email: employee.email || '',
        password: '',
        fullName: employee.fullName || '',
        phone: employee.phone || '',
        hourlyRate: employee.hourlyRate || '',
      });
    } else {
      setForm({ email: '', password: '', fullName: '', phone: '', hourlyRate: '' });
    }
    setErrors({});
  }, [employee, show]);

  const validate = () => {
    const errs = {};
    if (!isEdit && !form.email) errs.email = 'Vui lòng nhập email';
    if (!isEdit && !form.password) errs.password = 'Vui lòng nhập mật khẩu';
    if (!isEdit && form.password && form.password.length < 6) errs.password = 'Mật khẩu tối thiểu 6 ký tự';
    if (!form.fullName) errs.fullName = 'Vui lòng nhập họ tên';
    if (!form.phone) errs.phone = 'Vui lòng nhập số điện thoại';
    if (!form.hourlyRate || Number(form.hourlyRate) <= 0) errs.hourlyRate = 'Vui lòng nhập lương/giờ hợp lệ';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (isEdit) {
        await api.put(`/admin/employees/${employee.id}`, {
          fullName: form.fullName,
          phone: form.phone,
          hourlyRate: Number(form.hourlyRate),
        });
        toast.success('Cập nhật nhân viên thành công');
      } else {
        await api.post('/admin/employees', {
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          phone: form.phone,
          hourlyRate: Number(form.hourlyRate),
        });
        toast.success('Thêm nhân viên thành công');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.3)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0" style={{ borderRadius: 12 }}>
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-semibold">
              {isEdit ? 'Sửa nhân viên' : 'Thêm nhân viên mới'}
            </h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {!isEdit && (
                <>
                  <div className="mb-3">
                    <label className="form-label">Email <span className="text-danger">*</span></label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="example@email.com"
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Mật khẩu <span className="text-danger">*</span></label>
                    <input
                      type="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Tối thiểu 6 ký tự"
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </div>
                </>
              )}
              <div className="mb-3">
                <label className="form-label">Họ tên <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                />
                {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label">Số điện thoại <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="0901234567"
                />
                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label">Lương/giờ (VNĐ) <span className="text-danger">*</span></label>
                <input
                  type="number"
                  className={`form-control ${errors.hourlyRate ? 'is-invalid' : ''}`}
                  name="hourlyRate"
                  value={form.hourlyRate}
                  onChange={handleChange}
                  placeholder="30000"
                  min="0"
                />
                {errors.hourlyRate && <div className="invalid-feedback">{errors.hourlyRate}</div>}
              </div>
            </div>
            <div className="modal-footer border-top">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                Hủy
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? (
                  <><span className="spinner-border spinner-border-sm me-1" />Đang lưu...</>
                ) : (
                  isEdit ? 'Cập nhật' : 'Thêm mới'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
