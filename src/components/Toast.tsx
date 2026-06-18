import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import type { ToastMessage } from '../types';

type ToastProps = {
  toasts: ToastMessage[];
};

export function Toast({ toasts }: ToastProps) {
  return (
    <div className="fixed right-4 top-20 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
      {toasts.map((toast) => {
        const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? AlertCircle : Info;
        const tone =
          toast.type === 'success'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
            : toast.type === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-900'
              : 'border-violet-200 bg-violet-50 text-violet-900';
        return (
          <div key={toast.id} className={`flex gap-3 rounded-xl border p-4 shadow-lg ${tone}`}>
            <Icon size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        );
      })}
    </div>
  );
}
