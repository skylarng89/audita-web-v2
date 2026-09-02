<script setup lang="ts">
// Dashboard placeholder: summary metrics wire up in Sprint 2, Task 2.5.
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold mb-2">
      Welcome{{ auth.user ? ", " + auth.user.fullName : "" }}
    </h1>
    <p class="text-gray-500 dark:text-gray-400">
      Change-request summaries and SLA widgets land here in Sprint 2.
    </p>
  </div>
</template>
