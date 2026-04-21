export default function StatusBadge({ status }) {
  return <span className={`m3-badge m3-badge--status m3-badge--${status.toLowerCase()}`}>{status.replace("_", " ")}</span>;
}
