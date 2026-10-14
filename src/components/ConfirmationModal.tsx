import React from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  items?: { label: string; detail?: string }[];
  confirmButtonText?: string;
  confirmButtonVariant?: 'primary' | 'danger';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  items = [],
  confirmButtonText = 'Confirm & Update',
  confirmButtonVariant = 'primary',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl shrink-0 ${confirmButtonVariant === 'danger' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="mt-1 text-sm text-gray-600 leading-relaxed">{message}</p>
            </div>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {items.length > 0 && (
            <div className="mt-4 max-h-48 overflow-y-auto bg-gray-50 rounded-xl p-3 border border-gray-200/60 divide-y divide-gray-200/50">
              {items.map((item, idx) => (
                <div key={idx} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-800">{item.label}</span>
                  {item.detail && <span className="text-gray-500 font-mono">{item.detail}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-hidden transition-all shadow-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-xl text-white shadow-sm transition-all flex items-center gap-2 ${
              confirmButtonVariant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            } disabled:opacity-50`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Syncing with Classroom...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{confirmButtonText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
