import React, { useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'success';
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  isLoading = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  let btnColor = 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold';
  let Icon = Info;
  let iconBg = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';

  if (variant === 'danger') {
    btnColor = 'bg-rose-600 hover:bg-rose-500 text-white font-bold';
    Icon = AlertTriangle;
    iconBg = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
  } else if (variant === 'warning') {
    btnColor = 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold';
    Icon = AlertTriangle;
    iconBg = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
  } else if (variant === 'success') {
    btnColor = 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold';
    Icon = CheckCircle;
    iconBg = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />

        <div className="relative transform overflow-hidden rounded-xl bg-[#0F1626] text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-white/[0.1] text-white">
          <div className="p-6 pb-4">
            <div className="flex items-start gap-4">
              <div className={`mx-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white font-display">
                    {title}
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-white p-1 rounded-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2">
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#080C14] px-6 py-3.5 flex flex-row-reverse gap-3 border-t border-white/[0.08]">
            <button
              type="button"
              disabled={isLoading}
              onClick={onConfirm}
              className={`inline-flex justify-center items-center rounded-lg px-4 py-2 text-xs shadow-sm focus:outline-none ${btnColor} disabled:opacity-50`}
            >
              {isLoading ? 'Processing...' : confirmLabel}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary !text-xs !py-2 !px-4"
            >
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
