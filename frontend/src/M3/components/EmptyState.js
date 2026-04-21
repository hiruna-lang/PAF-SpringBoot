export default function EmptyState({ title, message, action }) {
  return (
    <div className="m3-empty-state">
      <div className="m3-empty-state__icon">O</div>
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  );
}
