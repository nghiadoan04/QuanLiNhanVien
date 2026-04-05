export default function Loading() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="spinner-border" style={{ color: 'var(--primary)' }} role="status">
        <span className="visually-hidden">Đang tải...</span>
      </div>
    </div>
  );
}
