import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { authApi, setAccessToken, type AuthUser } from "@/api/auth";
import { setTenantSlug } from "@/api/client";

/**
 * Auth session store (blueprint Sprint 1, Task 1.7).
 * The access token lives in memory only; the rotating refresh token is an
 * httpOnly cookie managed entirely by the backend (ADR-7), so a page reload
 * recovers the session via /auth/refresh.
 */
export const useAuthStore = defineStore("auth", () => {
  const user = ref<AuthUser | null>(null);
  const restorePromise = ref<Promise<void> | null>(null);

  const isAuthenticated = computed(() => user.value !== null);
  const role = computed(() => user.value?.roleName ?? "");

  async function login(
    email: string,
    password: string,
    tenantSlug: string,
  ): Promise<void> {
    setTenantSlug(tenantSlug);
    const res = await authApi.login(email, password);
    setAccessToken(res.accessToken);
    user.value = res.user;
  }

  /** Restore the session from the refresh cookie. Idempotent & deduped. */
  function restore(): Promise<void> {
    if (restorePromise.value) {
      return restorePromise.value;
    }
    restorePromise.value = (async () => {
      try {
        if (!localStorage.getItem("audita.tenantSlug")) {
          return;
        }
        const res = await authApi.refresh();
        setAccessToken(res.accessToken);
        user.value = res.user;
      } catch {
        setAccessToken(null);
        user.value = null;
      } finally {
        restorePromise.value = null;
      }
    })();
    return restorePromise.value;
  }

  async function logout(): Promise<void> {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      user.value = null;
    }
  }

  return { user, isAuthenticated, role, login, restore, logout };
});
