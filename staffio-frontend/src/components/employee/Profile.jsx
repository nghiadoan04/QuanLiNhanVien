import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import Loading from '../common/Loading';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/employee/profile');
      setProfile(res.data);
      setForm({ fullName: res.data.fullName || '', phone: res.data.phone || '' });
    } catch {
      toast.error('Lỗi tải thông tin hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setSubmitting(true);
    try {
      await api.put('/employee/profile', form);
      toast.success('Cập nhật hồ sơ thành công');
      setEditing(false);
      fetchProfile();
    } catch {
      toast.error('Lỗi cập nhật hồ sơ');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <h4 className="fw-bold mb-4">Hồ sơ cá nhân</h4>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-body">
              {/* Avatar & basic info */}
              <div className="text-center mb-4">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{
                    width: 80,
                    height: 80,
                    background: '#eef0fb',
                    color: 'var(--primary)',
                    fontSize: '2rem',
                    fontWeight: 700,
                  }}
                >
                  {profile?.fullName?.charAt(0) || 'N'}
                </div>
                <h5 className="fw-bold mb-1">{profile?.fullName}</h5>
                <p className="text-muted mb-0">{profile?.email}</p>
              </div>

              {!editing ? (
                /* View mode */
                <div>
                  <div className="row g-3">
                    <div className="col-sm-6">
                      <div className="p-3 border rounded">
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>Họ tên</div>
                        <div className="fw-medium">{profile?.fullName}</div>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="p-3 border rounded">
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>Email</div>
                        <div className="fw-medium">{profile?.email}</div>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="p-3 border rounded">
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>Số điện thoại</div>
                        <div className="fw-medium">{profile?.phone || 'Chưa cập nhật'}</div>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="p-3 border rounded">
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>Lương/giờ</div>
                        <div className="fw-medium">
                          {profile?.hourlyRate
                            ? `${Number(profile.hourlyRate).toLocaleString('vi-VN')}đ`
                            : 'Chưa cập nhật'}
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="p-3 border rounded">
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>Ngày tham gia</div>
                        <div className="fw-medium">{profile?.createdAt || 'N/A'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <button className="btn btn-primary" onClick={() => setEditing(true)}>
                      <i className="bi bi-pencil me-1"></i>Chỉnh sửa
                    </button>
                  </div>
                </div>
              ) : (
                /* Edit mode */
                <form onSubmit={handleSave}>
                  <div className="mb-3">
                    <label className="form-label">Họ tên</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Số điện thoại</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div className="d-flex gap-2 justify-content-center">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setEditing(false)}>
                      Hủy
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? (
                        <><span className="spinner-border spinner-border-sm me-1" />Đang lưu...</>
                      ) : (
                        <><i className="bi bi-check-lg me-1"></i>Lưu</>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
