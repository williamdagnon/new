import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  onClose: (id: string) => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ id, type, message, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      bgClass: 'bg-gradient-to-r from-green-500 to-emerald-600',
      iconClass: 'text-white',
    },
    error: {
      icon: XCircle,
      bgClass: 'bg-gradient-to-r from-red-500 to-rose-600',
      iconClass: 'text-white',
    },
    warning: {
      icon: AlertCircle,
      bgClass: 'bg-gradient-to-r from-amber-500 to-orange-600',
      iconClass: 'text-white',
    },
    info: {
      icon: Info,
      bgClass: 'bg-gradient-to-r from-blue-500 to-cyan-600',
      iconClass: 'text-white',
    },
  };

  const { icon: Icon, bgClass, iconClass } = config[type];

  return (
    <div
      className={`${bgClass} text-white rounded-xl shadow-2xl p-4 mb-3 min-w-[300px] max-w-md animate-slide-in-right`}
    >
      <div className="flex items-start space-x-3">
        <Icon className={`w-6 h-6 flex-shrink-0 ${iconClass}`} />
        <div className="flex-1">
          <p className="text-sm font-medium leading-relaxed">{message}</p>
        </div>
        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
