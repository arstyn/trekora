import { useState, useCallback } from "react";

interface ToastProps {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

interface Toast extends ToastProps {
  id: string;
  createdAt: number;
}

// Simple toast implementation
let toastCounter = 0;
const toastCallbacks: Set<(toasts: Toast[]) => void> = new Set();
let toasts: Toast[] = [];

const addToast = (props: ToastProps) => {
  const id = (++toastCounter).toString();
  const toast: Toast = {
    id,
    createdAt: Date.now(),
    duration: 5000,
    ...props,
  };

  toasts = [...toasts, toast];
  toastCallbacks.forEach((callback) => callback(toasts));

  // Auto remove toast after duration
  setTimeout(() => {
    removeToast(id);
  }, toast.duration);

  return id;
};

const removeToast = (id: string) => {
  toasts = toasts.filter((toast) => toast.id !== id);
  toastCallbacks.forEach((callback) => callback(toasts));
};

export const useToast = () => {
  const [state, setState] = useState<Toast[]>(toasts);

  useState(() => {
    toastCallbacks.add(setState);
    return () => {
      toastCallbacks.delete(setState);
    };
  });

  const toast = useCallback((props: ToastProps) => {
    // For now, we'll just use console.log and alert for notifications
    // In a real app, you'd integrate with a proper toast library like sonner or react-hot-toast
    const message = `${props.title}${props.description ? ': ' + props.description : ''}`;
    
    if (props.variant === "destructive") {
      console.error(message);
      // For errors, show a more prominent notification
      if (typeof window !== 'undefined') {
        setTimeout(() => alert(`Error: ${message}`), 100);
      }
    } else {
      console.log(message);
      // For success messages, just log to console
      if (typeof window !== 'undefined') {
        // You could show a brief notification here
        console.log(`Success: ${message}`);
      }
    }

    return addToast(props);
  }, []);

  const dismiss = useCallback((id: string) => {
    removeToast(id);
  }, []);

  return {
    toast,
    dismiss,
    toasts: state,
  };
}; 