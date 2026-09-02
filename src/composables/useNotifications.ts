import { ref, onUnmounted } from "vue";

export type NotificationHandler = (payload: unknown) => void;

/**
 * WebSocket composable with auto-reconnect and heartbeat awareness
 * (blueprint ADR-6 / Sprint 3, Task 3.6). Connects after login, reconnects
 * with capped exponential backoff, and exposes connection state for the
 * notification bell UI.
 */
export function useNotifications(onMessage: NotificationHandler) {
  const connected = ref(false);
  let socket: WebSocket | null = null;
  let attempt = 0;
  let closedByUser = false;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  function connect(): void {
    closedByUser = false;
    const wsProtocol = location.protocol === "https:" ? "wss" : "ws";
    const base = import.meta.env.VITE_API_BASE_URL
      ? import.meta.env.VITE_API_BASE_URL.replace(/^http/, "ws")
      : `${wsProtocol}://${location.host}`;
    socket = new WebSocket(`${base}/ws/notifications`);

    socket.onopen = () => {
      connected.value = true;
      attempt = 0;
      heartbeatTimer = setInterval(() => {
        if (socket?.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "ping" }));
        }
      }, 30_000);
    };
    socket.onmessage = (ev) => {
      try {
        onMessage(JSON.parse(ev.data as string));
      } catch {
        // Ignore malformed frames.
      }
    };
    socket.onclose = () => {
      connected.value = false;
      stopHeartbeat();
      if (!closedByUser) {
        scheduleReconnect();
      }
    };
    socket.onerror = () => {
      socket?.close();
    };
  }

  function scheduleReconnect(): void {
    // Capped exponential backoff: 1s, 2s, 4s, ... max 30s.
    const delay = Math.min(1000 * 2 ** attempt, 30_000);
    attempt++;
    reconnectTimer = setTimeout(connect, delay);
  }

  function stopHeartbeat(): void {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  }

  function disconnect(): void {
    closedByUser = true;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    stopHeartbeat();
    socket?.close();
    socket = null;
    connected.value = false;
  }

  onUnmounted(disconnect);

  return { connected, connect, disconnect };
}
