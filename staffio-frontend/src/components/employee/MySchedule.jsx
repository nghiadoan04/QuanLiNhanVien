import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import Loading from '../common/Loading';

export default function MySchedule() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchSchedule();
  }, [currentDate, viewMode]);

  const getDateRange = () => {
    const d = new Date(currentDate);
    let from, to;
    if (viewMode === 'week') {
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      from = new Date(d.setDate(diff));
      to = new Date(from);
      to.setDate(to.getDate() + 6);
    } else {
      from = new Date(d.getFullYear(), d.getMonth(), 1);
      to = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    }
    return {
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
    };
  };

  const fetchSchedule = async () => {
    const { from, to } = getDateRange();
    try {
      const res = await api.get('/employee/schedule', { params: { from, to } });
      setSchedule(res.data || []);
    } catch {
      toast.error('Lỗi tải lịch làm');
      setSchedule([]);
    } finally {
      setLoading(false);
    }
  };

  const navigate = (direction) => {
    const d = new Date(currentDate);
    if (viewMode === 'week') {
      d.setDate(d.getDate() + direction * 7);
    } else {
      d.setMonth(d.getMonth() + direction);
    }
    setCurrentDate(d);
  };

  const formatDateRange = () => {
    const { from, to } = getDateRange();
    return `${from} - ${to}`;
  };

  const getAttendanceBadge = (attendance) => {
    if (!attendance) return <span className="badge badge-pending">Chưa chấm</span>;
    if (attendance.checkIn && attendance.checkOut)
      return <span className="badge badge-approved">Hoàn thành</span>;
    if (attendance.checkIn)
      return <span className="badge" style={{ background: '#4361ee', color: '#fff' }}>Đã check-in</span>;
    return <span className="badge badge-pending">Chưa chấm</span>;
  };

  if (loading) return <Loading />;

  return (
    <div>
      <h4 className="fw-bold mb-4">Lịch làm việc</h4>

      {/* Controls */}
      <div className="card mb-3">
        <div className="card-body py-2">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="btn-group btn-group-sm">
              <button
                className={`btn ${viewMode === 'week' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('week')}
              >
                Tuần
              </button>
              <button
                className={`btn ${viewMode === 'month' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('month')}
              >
                Tháng
              </button>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
                <i className="bi bi-chevron-left"></i>
              </button>
              <span className="fw-medium" style={{ fontSize: '0.9rem', minWidth: 180, textAlign: 'center' }}>
                {formatDateRange()}
              </span>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(1)}>
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>

            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Hôm nay
            </button>
          </div>
        </div>
      </div>

      {/* Schedule list */}
      <div className="card">
        <div className="card-body p-0">
          {schedule.length === 0 ? (
            <p className="text-muted text-center py-4">
              Không có lịch làm trong khoảng thời gian này
            </p>
          ) : (
            <div className="list-group list-group-flush">
              {schedule.map((item, idx) => (
                <div className="list-group-item" key={idx}>
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                      <div className="fw-semibold">{item.shiftName || item.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                        <i className="bi bi-calendar3 me-1"></i>
                        {item.shiftDate || item.date}
                        <span className="mx-2">|</span>
                        <i className="bi bi-clock me-1"></i>
                        {item.startTime} - {item.endTime}
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      {getAttendanceBadge(item.attendance)}
                      {item.attendance?.checkIn && (
                        <small className="text-muted">
                          In: {item.attendance.checkIn}
                          {item.attendance.checkOut && ` | Out: ${item.attendance.checkOut}`}
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
