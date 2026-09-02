<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { authApi } from "@/api/auth";
import { useToastStore } from "@/stores/toast";
import { ApiError } from "@/api/client";

const toast = useToastStore();
const route = useRoute();
const router = useRouter();

const token = ref(
  typeof route.query.token === "string" ? route.query.token : "",
);
const newPassword = ref("");
const confirmPassword = ref("");
const submitting = ref(false);

async function submit(): Promise<void> {
  if (!token.value) {
    toast.error("Reset token is missing");
    return;
  }
  if (newPassword.value.length < 8) {
    toast.error("Password must be at least 8 characters");
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    toast.error("Passwords do not match");
    return;
  }
  submitting.value = true;
  try {
    await authApi.resetPassword(token.value, newPassword.value);
    toast.success("Password updated — sign in with your new password");
    await router.push({ name: "sign-in" });
  } catch (err) {
    toast.error(err instanceof ApiError ? err.problem.message : "Reset failed");
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="submit">
    <h1 class="text-lg font-semibold">Choose a new password</h1>
    <div>
      <label for="rp-token" class="block text-sm font-medium mb-1"
        >Reset token</label
      >
      <input
        id="rp-token"
        v-model="token"
        type="text"
        required
        class="w-full rounded-input border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
      />
    </div>
    <div>
      <label for="rp-password" class="block text-sm font-medium mb-1"
        >New password</label
      >
      <input
        id="rp-password"
        v-model="newPassword"
        type="password"
        required
        minlength="8"
        autocomplete="new-password"
        class="w-full rounded-input border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
      />
    </div>
    <div>
      <label for="rp-confirm" class="block text-sm font-medium mb-1"
        >Confirm password</label
      >
      <input
        id="rp-confirm"
        v-model="confirmPassword"
        type="password"
        required
        autocomplete="new-password"
        class="w-full rounded-input border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
      />
    </div>
    <button
      type="submit"
      :disabled="submitting"
      class="w-full rounded-input bg-accent-600 hover:bg-accent-700 disabled:opacity-50 text-white py-2 font-medium transition-colors duration-subtle"
    >
      {{ submitting ? "Updating…" : "Update password" }}
    </button>
  </form>
</template>
