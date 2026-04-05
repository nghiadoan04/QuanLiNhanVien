import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import Loading from '../common/Loading';
import EmployeeForm from './EmployeeForm';

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, [page, search]);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/admin/employees', {
        params: { page, size: 10, search: search || undefined },
      });
      setEmployees(res.data.content || res.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      toast.error('Lỗi tải danh sách nhân viên');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa nhân viên "${name}"?`)) return;
    try {
      await api.delete(`/admin/employees/${id}`);
      toast.success('Xóa nhân viên thành công');
      fetchEmployees();
    } catch {
      toast.error('Lỗi khi xóa nhân viên');
    }
  };

  const openAdd = () => {
    setEditEmployee(null);
    setShowForm(true);
  };

  const openEdit = (emp) => {
    setEditEmployee(emp);
    setShowForm(true);
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h4 className="fw-bold mb-0">Quản lý nhân viên</h4>
        <button className="btn btn-primary" onClick={openAdd}>
          <i className="bi bi-plus-lg me-1"></i>Thêm nhân viên
        </button>
      </div>

      {/* Search */}
      <div className="card mb-3">
        <div className="card-body py-2">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Tìm kiếm theo tên, email, SĐT..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>SĐT</th>
                  <th>Lương/giờ</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      Không có nhân viên nào
                    </td>
                  </tr>
                ) : (
                  employees.map((emp, idx) => (
                    <tr key={emp.id}>
                      <td>{page * 10 + idx + 1}</td>
                      <td className="fw-medium">{emp.fullName}</td>
                      <td>{emp.email}</td>
                      <td>{emp.phone}</td>
                      <td>{Number(emp.hourlyRate).toLocaleString('vi-VN')}đ</td>
                      <td>
                        <span className={`badge ${emp.active !== false ? 'badge-active' : 'badge-inactive'}`}>
                          {emp.active !== false ? 'Hoạt động' : 'Ngừng'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => openEdit(emp)}
                          title="Sửa"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(emp.id, emp.fullName)}
                          title="Xóa"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="card-footer bg-white border-top d-flex justify-content-center">
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(page - 1)}>
                    <i className="bi bi-chevron-left"></i>
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => (
                  <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(i)}>
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${page === totalPages - 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(page + 1)}>
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>

      {/* Employee Form Modal */}
      <EmployeeForm
        show={showForm}
        onClose={() => setShowForm(false)}
        employee={editEmployee}
        onSaved={fetchEmployees}
      />
    </div>
  );
}
