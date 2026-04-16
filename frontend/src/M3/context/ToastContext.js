import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { CloseIcon } from "../components/Icons";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(({ title, message, tone = "info" }) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, title, message, tone }]);
    window.setTimeout(() => dismissToast(id), 3200);
  }, [dismissToast]);

  const contextValue = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="m3-toast-stack">
        {toasts.map((toast) => (
          <div key={toast.id} className={`m3-toast m3-toast--${toast.tone}`}>
            <div>
              <strong>{toast.title}</strong>
              <p>{toast.message}</p>
            </div>
            <button type="button" className="m3-icon-button" onClick={() => dismissToast(toast.id)}>
              <CloseIcon />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToasts() {
  return useContext(ToastContext);
}
