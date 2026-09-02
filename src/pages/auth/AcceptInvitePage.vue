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
const password = ref("");
const confirmPassword = ref("");
const submitting = ref(false);

async function submit(): Promise<void> {
  if (!token.value) {
    toast.error("Invite token is missing");
    return;
  }
  if (password.value.length < 8) {
    toast.error("Password must be at least 8 characters");
    return;
  }
  if (password.value !== confirmPassword.value) {
    toast.error("Passwords do not match");
    return;
  }
  submitting.value = true;
  try {
    await authApi.acceptInvite(token.value, password.value);
    toast.success("Account activated — please sign in");
    await router.push({ name: "sign-in" });
  } catch (err) {
    toast.error(
      err instanceof ApiError
        ? err.problem.message
        : "Invite acceptance failed",
    );
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="submit">
    <h1 class="text-lg font-semibold">Accept your invitation</h1>
    <div>
      <label for="ai-token" class="block text-sm font-medium mb-1"
        >Invite token</label
      >
      <input
        id="ai-token"
        v-model="token"
        type="text"
        required
        class="w-full rounded-input border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
      />
    </div>
    <div>
      <label for="ai-password" class="block text-sm font-medium mb-1"
        >Password</label
      >
      <input
        id="ai-password"
        v-model="password"
        type="password"
        required
        minlength="8"
        autocomplete="new-password"
        class="w-full rounded-input border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
      />
    </div>
    <div>
      <label for="ai-confirm" class="block text-sm font-medium mb-1"
        >Confirm password</label
      >
      <input
        id="ai-confirm"
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
      {{ submitting ? "Activating…" : "Activate account" }}
    </button>
  </form>
</template>
