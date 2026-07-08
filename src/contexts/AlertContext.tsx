import { createContext, useContext, useState, type ReactNode, useCallback } from 'react';
import AlertModal from '../components/modals/AlertModal';
import type { AlertModalProps } from '../components/modals/AlertModal';

type ShowAlertParams = Omit<AlertModalProps, 'isOpen' | 'onConfirm'> & { onConfirm?: () => void };

interface AlertContextType {
  showAlert: (params: ShowAlertParams) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alertConfig, setAlertConfig] = useState<AlertModalProps>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
    onConfirm: () => { },
  });

  const hideAlert = useCallback(() => {
    setAlertConfig(prev => ({ ...prev, isOpen: false }));
  }, []);

  const showAlert = useCallback((params: ShowAlertParams) => {
    setAlertConfig({
      isOpen: true,
      ...params,
      onConfirm: () => {
        if (params.onConfirm) {
          params.onConfirm();
        }
        hideAlert();
      },
      onCancel: params.onCancel ? () => {
        if (params.onCancel) {
          params.onCancel();
        }
        hideAlert();
      } : hideAlert,
    });
  }, [hideAlert]);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <AlertModal {...alertConfig} />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
