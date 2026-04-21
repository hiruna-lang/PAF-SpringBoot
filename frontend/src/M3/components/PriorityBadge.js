export default function PriorityBadge({ priority }) {
  return (
    <span className={`m3-badge m3-badge--priority m3-badge--priority-${priority.toLowerCase()}`}>{priority}</span>
  );
}
