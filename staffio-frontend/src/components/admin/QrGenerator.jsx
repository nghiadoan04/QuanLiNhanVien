import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

export default function QrGenerator() {
  const [shifts, setShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState('');
  const [qrImage, setQrImage] = useState('');
  const [generating, setGenerating] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      const res = await api.get('/admin/shifts/available-for-qr');
      setShifts(res.data || []);
    } catch {
      toast.error('Lỗi tải danh sách ca');
      setShifts([]);
    }
  };

  const generateQr = async () => {
    if (!selectedShift) {
      toast.error('Vui lòng chọn ca làm');
      return;
    }
    setGenerating(true);
    try {
      const res = await api.post(`/admin/attendance/generate-qr/${selectedShift}`);
      setQrImage(res.data.qrImage || res.data);
      toast.success('Tạo mã QR thành công');
    } catch {
      toast.error('Lỗi tạo mã QR');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const shift = shifts.find((s) => String(s.id) === String(selectedShift));
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Chấm công - ${shift?.name || ''}</title>
          <style>
            body { text-align: center; font-family: Arial, sans-serif; padding: 40px; }
            h2 { margin-bottom: 8px; }
            p { color: #666; margin-bottom: 20px; }
            img { max-width: 300px; }
          </style>
        </head>
        <body>
          <h2>Staffio - Chấm công</h2>
          <p>${shift?.name || ''} - ${shift?.date || ''} (${shift?.startTime || ''} - ${shift?.endTime || ''})</p>
          <img src="${qrImage}" alt="QR Code" />
          <p style="margin-top: 16px;">Quét mã QR để chấm công</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const selectedShiftInfo = shifts.find((s) => String(s.id) === String(selectedShift));

  return (
    <div>
      <h4 className="fw-bold mb-4">Chấm công - Tạo mã QR</h4>

      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card">
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Chọn ca làm</label>
                <select
                  className="form-select"
                  value={selectedShift}
                  onChange={(e) => { setSelectedShift(e.target.value); setQrImage(''); }}
                >
                  <option value="">-- Chọn ca --</option>
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} - {s.date} ({s.startTime} - {s.endTime})
                    </option>
                  ))}
                </select>
                {shifts.length === 0 && (
                  <small className="text-muted">Không có ca nào khả dụng (hôm nay/tương lai)</small>
                )}
              </div>

              <button
                className="btn btn-primary w-100 mb-3"
                onClick={generateQr}
                disabled={generating || !selectedShift}
              >
                {generating ? (
                  <><span className="spinner-border spinner-border-sm me-1" />Đang tạo...</>
                ) : (
                  <><i className="bi bi-qr-code me-1"></i>Tạo mã QR</>
                )}
              </button>

              {qrImage && (
                <div className="text-center" ref={printRef}>
                  <div className="border rounded p-3 mb-3" style={{ background: '#fafafa' }}>
                    {selectedShiftInfo && (
                      <div className="mb-2">
                        <div className="fw-semibold">{selectedShiftInfo.name}</div>
                        <small className="text-muted">
                          {selectedShiftInfo.date} | {selectedShiftInfo.startTime} - {selectedShiftInfo.endTime}
                        </small>
                      </div>
                    )}
                    <img
                      src={qrImage}
                      alt="QR Code"
                      style={{ maxWidth: '280px', width: '100%' }}
                    />
                    <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.85rem' }}>
                      Nhân viên quét mã này để chấm công
                    </p>
                  </div>

                  <button className="btn btn-outline-primary" onClick={handlePrint}>
                    <i className="bi bi-printer me-1"></i>In mã QR
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
