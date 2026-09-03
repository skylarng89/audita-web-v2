<script setup lang="ts">
// New change-request form (Sprint 2, Task 2.8) — mirrors v1's PM-style form
// (title, dates, affected systems, scope & description, priority label).
import { ref } from "vue";
import { useRouter } from "vue-router";
import { changeRequestApi } from "@/api/changeRequests";
import { useToastStore } from "@/stores/toast";
import { ApiError } from "@/api/client";

const router = useRouter();
const toast = useToastStore();

const title = ref("");
const description = ref("");
const priority = ref<"low" | "medium" | "high">("medium");
const scheduledStart = ref("");
const scheduledEnd = ref("");
const affectedSystemsRaw = ref("");
const submitting = ref(false);

async function submit(): Promise<void> {
  if (!title.value.trim()) {
    toast.error("Title is required");
    return;
  }
  const input = {
    title: title.value,
    description: description.value,
    priority: priority.value,
    scheduledStart: scheduledStart.value
      ? new Date(scheduledStart.value).toISOString()
      : null,
    scheduledEnd: scheduledEnd.value
      ? new Date(scheduledEnd.value).toISOString()
      : null,
    affectedSystems: affectedSystemsRaw.value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
  submitting.value = true;
  try {
    const cr = await changeRequestApi.create(input);
    toast.success("Draft created");
    await router.push({ name: "cr-detail", params: { id: cr.id } });
  } catch (err) {
    toast.error(
      err instanceof ApiError ? err.problem.message : "Failed to create draft",
    );
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="max-w-2xl">
    <h1 class="text-2xl font-semibold mb-6">New change request</h1>
    <form
      class="space-y-5 bg-white dark:bg-gray-900 rounded-card shadow-sm p-6"
      @submit.prevent="submit"
    >
      <div>
        <label for="cr-title" class="block text-sm font-medium mb-1"
          >Title</label
        >
        <input
          id="cr-title"
          v-model="title"
          type="text"
          required
          class="w-full rounded-input border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="cr-start" class="block text-sm font-medium mb-1"
            >Start (optional)</label
          >
          <input
            id="cr-start"
            v-model="scheduledStart"
            type="datetime-local"
            class="w-full rounded-input border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
          />
        </div>
        <div>
          <label for="cr-end" class="block text-sm font-medium mb-1"
            >End (optional)</label
          >
          <input
            id="cr-end"
            v-model="scheduledEnd"
            type="datetime-local"
            class="w-full rounded-input border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
          />
        </div>
      </div>
      <div>
        <label for="cr-systems" class="block text-sm font-medium mb-1"
          >Affected systems (comma-separated)</label
        >
        <input
          id="cr-systems"
          v-model="affectedSystemsRaw"
          type="text"
          placeholder="api-gateway, billing-db"
          class="w-full rounded-input border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
        />
      </div>
      <fieldset class="border-0 p-0 m-0">
        <legend class="block text-sm font-medium mb-1">Priority</legend>
        <div class="flex gap-2">
          <button
            v-for="p in ['low', 'medium', 'high']"
            :key="p"
            type="button"
            class="rounded-input px-3 py-1.5 text-sm capitalize transition-colors duration-subtle"
            :class="
              priority === p
                ? 'bg-accent-600 text-white'
                : 'border border-gray-300 dark:border-gray-700'
            "
            @click="priority = p"
          >
            {{ p }}
          </button>
        </div>
      </fieldset>
      <div>
        <label for="cr-desc" class="block text-sm font-medium mb-1"
          >Scope &amp; description</label
        >
        <textarea
          id="cr-desc"
          v-model="description"
          rows="6"
          class="w-full rounded-input border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
        ></textarea>
      </div>
      <button
        type="submit"
        :disabled="submitting"
        class="rounded-input bg-accent-600 hover:bg-accent-700 disabled:opacity-50 text-white px-5 py-2 font-medium transition-colors duration-subtle"
      >
        {{ submitting ? "Saving…" : "Create draft" }}
      </button>
    </form>
  </div>
</template>
