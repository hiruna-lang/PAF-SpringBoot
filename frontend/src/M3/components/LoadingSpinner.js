export default function LoadingSpinner({ label = "Loading" }) {
  return (
    <div className="m3-loading">
      <span className="m3-spinner" />
      <span>{label}</span>
    </div>
  );
}
