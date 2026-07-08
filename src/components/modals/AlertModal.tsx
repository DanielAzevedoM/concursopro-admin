import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export type AlertType = "success" | "error" | "warning";

export interface AlertModalProps {
  isOpen: boolean;
  type: AlertType;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function AlertModal({
  isOpen,
  type,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText,
  cancelText = "Cancelar",
}: AlertModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-12 h-12 text-emerald-500" />;
      case "error":
        return <XCircle className="w-12 h-12 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-12 h-12 text-amber-500" />;
    }
  };

  const getIconBackground = () => {
    switch (type) {
      case "success":
        return "bg-emerald-50";
      case "error":
        return "bg-red-50";
      case "warning":
        return "bg-amber-50";
    }
  };

  const getConfirmButtonStyles = () => {
    switch (type) {
      case "success":
        return "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 focus:ring-emerald-500";
      case "error":
        return "bg-red-600 hover:bg-red-700 text-white shadow-red-200 focus:ring-red-500";
      case "warning":
        return "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200 focus:ring-amber-500";
    }
  };

  const defaultConfirmText = () => {
    switch (type) {
      case "success":
      case "error":
        return "OK";
      case "warning":
        return "Confirmar";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className={`p-4 rounded-full ${getIconBackground()}`}>
              {getIcon()}
            </div>
          </div>
          
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3">{title}</h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">{message}</p>
          
          <div className="flex gap-3 justify-center w-full">
            {type === "warning" && onCancel && (
              <button
                onClick={onCancel}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={onConfirm}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${getConfirmButtonStyles()}`}
            >
              {confirmText || defaultConfirmText()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
