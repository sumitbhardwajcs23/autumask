import React from 'react';
import { RefreshCw, AlertCircle, Inbox, Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading live data from server...' }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
    <p className="text-xs font-semibold text-slate-500 animate-pulse">{message}</p>
  </div>
);

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  title?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  title = 'Failed to load data',
}) => (
  <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 bg-rose-50/60 rounded-3xl border border-rose-200/80 m-4">
    <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
      <AlertCircle className="w-6 h-6" />
    </div>
    <div className="max-w-md">
      <h4 className="text-sm font-bold text-rose-900">{title}</h4>
      <p className="text-xs text-rose-700 mt-1">{error}</p>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Retry Request</span>
      </button>
    )}
  </div>
);

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => (
  <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
      {icon || <Inbox className="w-6 h-6" />}
    </div>
    <div className="max-w-sm">
      <h4 className="text-sm font-bold text-slate-700">{title}</h4>
      <p className="text-xs text-slate-500 mt-1">{description}</p>
    </div>
    {actionText && onAction && (
      <button
        onClick={onAction}
        className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
      >
        {actionText}
      </button>
    )}
  </div>
);
