import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = Info;
        let bgStyle = 'bg-slate-900 border-slate-700 text-white';
        let iconStyle = 'text-blue-400';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          iconStyle = 'text-emerald-400';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          iconStyle = 'text-amber-400';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          iconStyle = 'text-rose-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg transition-all duration-300 transform translate-y-0 ${bgStyle}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconStyle}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold tracking-wide text-slate-100">{toast.title}</p>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-0.5"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
