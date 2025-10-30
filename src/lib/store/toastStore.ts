import { writable } from "svelte/store";

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);

  return {
    subscribe,
    success: (message: string, duration = 3000) => {
      const id = Math.random().toString(36).substr(2, 9);
      const toast: Toast = { id, type: "success", message, duration };

      update((toasts) => [...toasts, toast]);

      if (duration > 0) {
        setTimeout(() => {
          update((toasts) => toasts.filter((t) => t.id !== id));
        }, duration);
      }
    },
    error: (message: string, duration = 4000) => {
      const id = Math.random().toString(36).substr(2, 9);
      const toast: Toast = { id, type: "error", message, duration };

      update((toasts) => [...toasts, toast]);

      if (duration > 0) {
        setTimeout(() => {
          update((toasts) => toasts.filter((t) => t.id !== id));
        }, duration);
      }
    },
    warning: (message: string, duration = 3500) => {
      const id = Math.random().toString(36).substr(2, 9);
      const toast: Toast = { id, type: "warning", message, duration };

      update((toasts) => [...toasts, toast]);

      if (duration > 0) {
        setTimeout(() => {
          update((toasts) => toasts.filter((t) => t.id !== id));
        }, duration);
      }
    },
    info: (message: string, duration = 3000) => {
      const id = Math.random().toString(36).substr(2, 9);
      const toast: Toast = { id, type: "info", message, duration };

      update((toasts) => [...toasts, toast]);

      if (duration > 0) {
        setTimeout(() => {
          update((toasts) => toasts.filter((t) => t.id !== id));
        }, duration);
      }
    },
    dismiss: (id: string) => {
      update((toasts) => toasts.filter((t) => t.id !== id));
    },
    clear: () => {
      update(() => []);
    },
  };
}

export const toastStore = createToastStore();
