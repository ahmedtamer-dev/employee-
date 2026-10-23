import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext({
  showToast: () => {},
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(({ title, text, tone = 'success', duration = 3500 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, text, tone }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast--${toast.tone}`}>
            <span className="toast__icon">
              {toast.tone === 'success' && '✓'}
              {toast.tone === 'error' && '✕'}
              {toast.tone === 'warning' && '⚠'}
              {toast.tone === 'info' && 'ℹ'}
            </span>
            <div className="toast__content">
              {toast.title ? <strong>{toast.title}</strong> : null}
              {toast.text ? <p>{toast.text}</p> : null}
            </div>
            <button
              type="button"
              className="toast__close"
              onClick={() => removeToast(toast.id)}
              aria-label="إغلاق"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
