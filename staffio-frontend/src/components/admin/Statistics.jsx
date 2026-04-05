import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import Loading from '../common/Loading';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Statistics() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [details, setDetails] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setDateFrom(firstDay.toISOString().split('T')[0]);
    setDateTo(lastDay.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (dateFrom && dateTo) fetchStatistics();
  }, [dateFrom, dateTo]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const [overviewRes, detailsRes] = await Promise.all([
        api.get('/admin/statistics/overview', { params: { from: dateFrom, to: dateTo } }),
        api.get('/admin/statistics/details', { params: { from: dateFrom, to: dateTo } }),
      ]);
      setOverview(overviewRes.data);
      setDetails(detailsRes.data || []);
    } catch {
      toast.error('Lỗi tải thống kê');
      setOverview({
        totalEmployees: 0,
        totalShiftsThisMonth: 0,
        totalHoursThisMonth: 0,
        totalSalaryThisMonth: 0,
      });
      setDetails([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  const stats = [
    { label: 'Tổng nhân viên', value: overview?.totalEmployees || 0, variant: '', icon: 'bi-people' },
    { label: 'Tổng ca', value: overview?.totalShiftsThisMonth || 0, variant: 'success', icon: 'bi-calendar-check' },
    { label: 'Tổng giờ làm', value: `${overview?.totalHoursThisMonth || 0}h`, variant: 'warning', icon: 'bi-clock' },
    { label: 'Tổng lương', value: `${(overview?.totalSalaryThisMonth || 0).toLocaleString('vi-VN')}đ`, variant: 'danger', icon: 'bi-cash-stack' },
  ];

  const chartData = {
    labels: details.map((d) => d.employeeName),
    datasets: [
      {
        label: 'Giờ làm',
        data: details.map((d) => d.totalHours || 0),
        backgroundColor: '#4361ee',
        borderRadius: 6,
        maxBarThickness: 40,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Giờ làm theo nhân viên', font: { size: 14, weight: '600' } },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Giờ' } },
      x: { ticks: { maxRotation: 45 } },
    },
  };

  const totalHours = details.reduce((sum, d) => sum + (d.totalHours || 0), 0);
  const totalSalary = details.reduce((sum, d) => sum + (d.totalSalary || 0), 0);
  const totalShifts = details.reduce((sum, d) => sum + (d.shiftCount || 0), 0);

  return (
    <div>
      <h4 className="fw-bold mb-4">Thống kê</h4>

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

      {/* Chart */}
      {details.length > 0 && (
        <div className="card mb-4">
          <div className="card-body">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Detail table */}
      <div className="card">
        <div className="card-header bg-white border-bottom">
          <h6 className="mb-0 fw-semibold">Chi tiết theo nhân viên</h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Nhân viên</th>
                  <th>Số ca</th>
                  <th>Tổng giờ</th>
                  <th>Lương/giờ</th>
                  <th>Tổng lương</th>
                </tr>
              </thead>
              <tbody>
                {details.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  <>
                    {details.map((d, idx) => (
                      <tr key={idx}>
                        <td className="fw-medium">{d.employeeName}</td>
                        <td>{d.shiftCount || 0}</td>
                        <td>{d.totalHours || 0}h</td>
                        <td>{Number(d.hourlyRate || 0).toLocaleString('vi-VN')}đ</td>
                        <td className="fw-semibold">{Number(d.totalSalary || 0).toLocaleString('vi-VN')}đ</td>
                      </tr>
                    ))}
                    <tr className="table-light fw-bold">
                      <td>TỔNG CỘNG</td>
                      <td>{totalShifts}</td>
                      <td>{totalHours}h</td>
                      <td></td>
                      <td>{totalSalary.toLocaleString('vi-VN')}đ</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
