import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../../api/axios';
import { toast } from 'react-toastify';

export default function QrScanner() {
  const [mode, setMode] = useState(null); // 'checkin' or 'checkout'
  const [scanning, setScanning] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const html5QrRef = useRef(null);
  const pendingModeRef = useRef(null);

  const stopScanner = useCallback(async () => {
    try {
      if (html5QrRef.current && html5QrRef.current.isScanning) {
        await html5QrRef.current.stop();
      }
    } catch {
      // ignore
    }
    setScanning(false);
    setCameraReady(false);
  }, []);

  useEffect(() => {
    requestCameraPermission();
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      // Permission granted - stop the stream, we'll use html5-qrcode to manage it
      stream.getTracks().forEach((track) => track.stop());
      setCameraReady(true);
      setCameraError(null);
    } catch (err) {
      console.error('Camera permission error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Bạn đã từ chối quyền camera. Vui lòng cấp quyền trong cài đặt trình duyệt.'
          : 'Không tìm thấy camera. Vui lòng kiểm tra thiết bị.'
      );
    }
  };

  const startScanner = (type) => {
    setMode(type);
    setResult(null);
    setScanning(true);
    pendingModeRef.current = type;
  };

  // Wait for DOM to render #qr-reader before initializing html5-qrcode
  useEffect(() => {
    if (!scanning) return;

    const initScanner = async () => {
      try {
        const html5Qr = new Html5Qrcode('qr-reader');
        html5QrRef.current = html5Qr;

        await html5Qr.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            await handleScan(decodedText, pendingModeRef.current);
            stopScanner();
          },
          () => {
            // ignore scan errors
          }
        );
      } catch (err) {
        console.error('Camera error:', err);
        toast.error('Không thể mở camera. Vui lòng cho phép truy cập camera.');
        setScanning(false);
        setMode(null);
      }
    };

    initScanner();
  }, [scanning]);

  const handleScan = async (qrData, type) => {
    if (processing) return;
    setProcessing(true);

    try {
      const endpoint = type === 'checkin'
        ? '/employee/attendance/check-in'
        : '/employee/attendance/check-out';

      const res = await api.post(endpoint, { qrToken: qrData });

      setResult({
        success: true,
        type,
        time: res.data.time || new Date().toLocaleTimeString('vi-VN'),
        message: res.data.message || (type === 'checkin' ? 'Check-in thành công' : 'Check-out thành công'),
      });
      toast.success(type === 'checkin' ? 'Check-in thành công!' : 'Check-out thành công!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi chấm công';
      setResult({
        success: false,
        type,
        message: msg,
      });
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <h4 className="fw-bold mb-4">Quét QR chấm công</h4>

      <div className="row justify-content-center">
        <div className="col-lg-6">
          {/* Camera error */}
          {cameraError && !result && (
            <div className="card mb-3">
              <div className="card-body text-center">
                <i className="bi bi-camera-video-off text-danger" style={{ fontSize: '3rem' }}></i>
                <p className="text-danger mt-2 mb-3">{cameraError}</p>
                <button className="btn btn-outline-primary" onClick={requestCameraPermission}>
                  <i className="bi bi-arrow-clockwise me-1"></i>Thử lại
                </button>
              </div>
            </div>
          )}

          {/* Action buttons - show when camera is ready */}
          {cameraReady && !scanning && !result && (
            <div className="card mb-3">
              <div className="card-body text-center">
                <i className="bi bi-camera-fill text-success mb-2" style={{ fontSize: '2rem' }}></i>
                <p className="text-muted mb-3">Camera đã sẵn sàng. Chọn loại chấm công để bắt đầu quét.</p>
                <div className="d-flex gap-3 justify-content-center">
                  <button
                    className="btn btn-primary px-4 py-2"
                    onClick={() => startScanner('checkin')}
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i>Check-in
                  </button>
                  <button
                    className="btn btn-outline-primary px-4 py-2"
                    onClick={() => startScanner('checkout')}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>Check-out
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading camera permission */}
          {!cameraReady && !cameraError && !result && (
            <div className="card mb-3">
              <div className="card-body text-center py-4">
                <div className="spinner-border text-primary mb-3" role="status"></div>
                <p className="text-muted mb-0">Đang yêu cầu quyền truy cập camera...</p>
              </div>
            </div>
          )}

          {/* Scanner */}
          {scanning && (
            <div className="card mb-3">
              <div className="card-header bg-white border-bottom text-center">
                <span className="fw-semibold">
                  {mode === 'checkin' ? 'Quét QR Check-in' : 'Quét QR Check-out'}
                </span>
              </div>
              <div className="card-body">
                <div className="qr-scanner-container">
                  <div id="qr-reader"></div>
                </div>
                <div className="text-center mt-3">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => { stopScanner(); setMode(null); }}
                  >
                    <i className="bi bi-x-circle me-1"></i>Hủy
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="card mb-3">
              <div className="card-body text-center">
                <div className="mb-3">
                  {result.success ? (
                    <i
                      className="bi bi-check-circle-fill"
                      style={{ fontSize: '3rem', color: 'var(--success)' }}
                    ></i>
                  ) : (
                    <i
                      className="bi bi-x-circle-fill"
                      style={{ fontSize: '3rem', color: 'var(--danger)' }}
                    ></i>
                  )}
                </div>
                <h5 className="fw-semibold">
                  {result.success
                    ? (result.type === 'checkin' ? 'Check-in thành công' : 'Check-out thành công')
                    : 'Chấm công thất bại'}
                </h5>
                <p className="text-muted">{result.message}</p>
                {result.time && (
                  <p className="fw-medium" style={{ color: 'var(--primary)' }}>
                    <i className="bi bi-clock me-1"></i>Thời gian: {result.time}
                  </p>
                )}
                <button
                  className="btn btn-primary mt-2"
                  onClick={() => { setResult(null); setMode(null); }}
                >
                  Quét lại
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
