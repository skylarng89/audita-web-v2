<script setup lang="ts">
// DefaultLayout: authenticated app shell — top nav, notification bell,
// toast region. Module pages render in the RouterView slot.
import { RouterView, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useToastStore } from "@/stores/toast";
import { IconBell, IconLogout } from "@tabler/icons-vue";

const auth = useAuthStore();
const toast = useToastStore();
const router = useRouter();

async function signOut(): Promise<void> {
  await auth.logout();
  toast.success("Signed out");
  await router.push({ name: "sign-in" });
}
</script>

<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100"
  >
    <header
      class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
    >
      <div
        class="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between"
      >
        <RouterLink
          :to="{ name: 'dashboard' }"
          class="text-lg font-semibold text-accent-600 dark:text-accent-400"
        >
          Audita
        </RouterLink>
        <nav class="flex items-center gap-4">
          <button
            type="button"
            class="p-2 rounded-input hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-subtle"
            aria-label="Notifications"
          >
            <IconBell class="w-5 h-5" />
          </button>
          <span
            v-if="auth.user"
            class="text-sm text-gray-600 dark:text-gray-400"
          >
            {{ auth.user.fullName }}
          </span>
          <button
            type="button"
            class="p-2 rounded-input hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-subtle"
            aria-label="Sign out"
            @click="signOut"
          >
            <IconLogout class="w-5 h-5" />
          </button>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-8">
      <RouterView />
    </main>

    <!-- Toast region: top-right singleton (v1 FR-12.2/12.3). -->
    <div
      class="fixed top-4 right-4 z-50 flex flex-col gap-2"
      aria-live="polite"
    >
      <TransitionGroup name="toast">
        <div
          v-for="t in toast.toasts"
          :key="t.id"
          class="rounded-card px-4 py-3 shadow-lg text-sm max-w-sm"
          :class="
            t.kind === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          "
        >
          {{ t.message }}
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all var(--duration-subtle) var(--ease-subtle);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}
</style>
