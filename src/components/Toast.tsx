import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// Toast context and hook for global toast management
let toastListeners: ((toast: Toast) => void)[] = [];

export const showToast = (
  message: string,
  type: ToastType = "info",
  duration = 4000,
) => {
  const id = Math.random().toString(36).substr(2, 9);
  const toast: Toast = { id, message, type, duration };
  toastListeners.forEach((listener) => listener(toast));
};

const getIcon = (type: ToastType) => {
  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠",
  };
  return icons[type];
};

const getColors = (type: ToastType) => {
  const colors = {
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: "text-green-600",
      text: "text-green-800",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: "text-red-600",
      text: "text-red-800",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "text-blue-600",
      text: "text-blue-800",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      icon: "text-yellow-600",
      text: "text-yellow-800",
    },
  };
  return colors[type];
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToast = (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);

      if (toast.duration !== Infinity) {
        const timer = setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== toast.id));
        }, toast.duration || 4000);

        return () => clearTimeout(timer);
      }
    };

    toastListeners.push(handleToast);
    return () => {
      toastListeners = toastListeners.filter(
        (listener) => listener !== handleToast,
      );
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-md pointer-events-none">
      {toasts.map((toast) => {
        const colors = getColors(toast.type);
        return (
          <div
            key={toast.id}
            className={`${colors.bg} ${colors.border} border rounded-lg p-4 shadow-lg pointer-events-auto animate-in slide-in-from-right-full duration-300`}
          >
            <div className="flex items-start gap-3">
              <span className={`${colors.icon} text-xl flex-shrink-0`}>
                {getIcon(toast.type)}
              </span>
              <div className="flex-1">
                <p className={`${colors.text} text-sm font-medium`}>
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className={`${colors.icon} hover:opacity-70 flex-shrink-0 transition-opacity`}
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
