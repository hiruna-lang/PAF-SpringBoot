import React, { useEffect } from "react";

/**
 * Toast notification component.
 * Props: toasts = [{ id, type, message }], onRemove(id)
 */
function Toast({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icons = { success: "✓", error: "✕", info: "ℹ" };
  return (
    <div className={`toast toast-${toast.type}`} onClick={() => onRemove(toast.id)}>
      <span style={{ fontSize: "1rem", fontWeight: 800 }}>{icons[toast.type] || "ℹ"}</span>
      <span>{toast.message}</span>
    </div>
  );
}

export default Toast;

let _nextId = 1;
export function makeToast(type, message) {
  return { id: _nextId++, type, message };
}
