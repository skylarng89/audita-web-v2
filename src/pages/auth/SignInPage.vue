<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useToastStore } from "@/stores/toast";
import { ApiError } from "@/api/client";

const auth = useAuthStore();
const toast = useToastStore();
const route = useRoute();
const router = useRouter();

const email = ref("");
const password = ref("");
const tenantSlug = ref("");
const submitting = ref(false);

async function submit(): Promise<void> {
  if (!email.value || !password.value || !tenantSlug.value) {
    toast.error("Email, password, and organisation are required");
    return;
  }
  submitting.value = true;
  try {
    await auth.login(email.value, password.value, tenantSlug.value);
    toast.success("Signed in");
    const redirect =
      typeof route.query.redirect === "string" ? route.query.redirect : "/";
    await router.push(redirect);
  } catch (err) {
    toast.error(
      err instanceof ApiError ? err.problem.message : "Sign-in failed",
    );
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="submit">
    <div>
      <label for="tenant" class="block text-sm font-medium mb-1"
        >Organisation</label
      >
      <input
        id="tenant"
        v-model="tenantSlug"
        type="text"
        required
        autocomplete="organization"
        placeholder="acme"
        class="w-full rounded-input border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
      />
    </div>
    <div>
      <label for="email" class="block text-sm font-medium mb-1">Email</label>
      <input
        id="email"
        v-model="email"
        type="email"
        required
        autocomplete="username"
        class="w-full rounded-input border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
      />
    </div>
    <div>
      <label for="password" class="block text-sm font-medium mb-1"
        >Password</label
      >
      <input
        id="password"
        v-model="password"
        type="password"
        required
        autocomplete="current-password"
        class="w-full rounded-input border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
      />
    </div>
    <button
      type="submit"
      :disabled="submitting"
      class="w-full rounded-input bg-accent-600 hover:bg-accent-700 disabled:opacity-50 text-white py-2 font-medium transition-colors duration-subtle"
    >
      {{ submitting ? "Signing in…" : "Sign in" }}
    </button>
    <div class="flex justify-between text-sm text-gray-500">
      <RouterLink
        :to="{ name: 'forgot-password' }"
        class="hover:text-accent-600"
        >Forgot password?</RouterLink
      >
      <RouterLink :to="{ name: 'accept-invite' }" class="hover:text-accent-600"
        >Accept invite</RouterLink
      >
    </div>
  </form>
</template>
