import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
  useEffect,
} from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const TOAST_TIMEOUT = 4000;

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    setToasts(prev => {
      const id = Date.now() + Math.random();
      const nextToast: Toast = {
        id,
        duration: TOAST_TIMEOUT,
        ...toast,
      };
      return [...prev, nextToast];
    });
  }, []);

  useEffect(() => {
    if (!toasts.length) {
      return;
    }

    const timers = toasts.map(toast => {
      const timeout = toast.duration ?? TOAST_TIMEOUT;
      return setTimeout(() => removeToast(toast.id), timeout);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [toasts, removeToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-xs">
        {toasts.map(({ id, message, type }) => {
          const baseStyles =
            type === 'success'
              ? 'bg-emerald-500'
              : type === 'error'
                ? 'bg-rose-500'
                : 'bg-slate-700';

          return (
            <div
              key={id}
              className={`${baseStyles} text-white px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 transition-all ease-out`}
            >
              <span className="text-sm font-medium leading-snug">{message}</span>
              <button
                type="button"
                onClick={() => removeToast(id)}
                className="ml-auto text-white/80 hover:text-white"
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
