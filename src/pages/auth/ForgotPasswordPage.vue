<script setup lang="ts">
import { ref } from "vue";
import { authApi } from "@/api/auth";
import { useToastStore } from "@/stores/toast";
import { ApiError } from "@/api/client";

const toast = useToastStore();
const email = ref("");
const submitting = ref(false);

async function submit(): Promise<void> {
  if (!email.value) {
    toast.error("Email is required");
    return;
  }
  submitting.value = true;
  try {
    await authApi.forgotPassword(email.value);
    // Always success-shaped to avoid account enumeration.
    toast.success("If that account exists, a reset link has been sent");
    email.value = "";
  } catch (err) {
    toast.error(
      err instanceof ApiError ? err.problem.message : "Request failed",
    );
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="submit">
    <h1 class="text-lg font-semibold">Reset your password</h1>
    <div>
      <label for="fp-email" class="block text-sm font-medium mb-1">Email</label>
      <input
        id="fp-email"
        v-model="email"
        type="email"
        required
        autocomplete="username"
        class="w-full rounded-input border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
      />
    </div>
    <button
      type="submit"
      :disabled="submitting"
      class="w-full rounded-input bg-accent-600 hover:bg-accent-700 disabled:opacity-50 text-white py-2 font-medium transition-colors duration-subtle"
    >
      {{ submitting ? "Sending…" : "Send reset link" }}
    </button>
    <RouterLink
      :to="{ name: 'sign-in' }"
      class="block text-center text-sm text-gray-500 hover:text-accent-600"
    >
      Back to sign in
    </RouterLink>
  </form>
</template>
