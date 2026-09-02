<script setup lang="ts">
// AuthLayout: centered card shell for sign-in / reset / invite flows.
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4"
  >
    <div
      class="w-full max-w-md bg-white dark:bg-gray-900 rounded-card shadow-sm p-8"
    >
      <div class="mb-8 flex justify-center">
        <span
          class="text-2xl font-semibold text-accent-600 dark:text-accent-400"
          >Audita</span
        >
      </div>
      <RouterView />
    </div>
  </div>
</template>
