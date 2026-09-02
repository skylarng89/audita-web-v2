import { defineStore } from "pinia";
import { ref } from "vue";

export interface Toast {
  id: number;
  kind: "success" | "error";
  message: string;
}

let nextId = 1;

/**
 * Toast singleton store (v1 FR-12 / blueprint Sprint 3, Task 3.6).
 * Every save/action produces exactly one toast, rendered top-right.
 */
export const useToastStore = defineStore("toast", () => {
  const toasts = ref<Toast[]>([]);

  function show(kind: Toast["kind"], message: string, ttlMs = 4000): void {
    const toast: Toast = { id: nextId++, kind, message };
    toasts.value.push(toast);
    setTimeout(() => dismiss(toast.id), ttlMs);
  }

  function success(message: string): void {
    show("success", message);
  }

  function error(message: string): void {
    show("error", message);
  }

  function dismiss(id: number): void {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  return { toasts, success, error, dismiss };
});
