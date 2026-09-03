<script setup lang="ts">
// Change-request list page (Sprint 2, Task 2.8).
import { computed, ref } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { changeRequestApi, type ChangeRequest } from "@/api/changeRequests";
import { IconPlus } from "@tabler/icons-vue";

const statusFilter = ref<ChangeRequest["status"] | "">("");

const { data, isLoading } = useQuery({
  queryKey: computed(() => ["change-requests", statusFilter.value]),
  queryFn: () => changeRequestApi.list(statusFilter.value || undefined),
});

const statusLabels: Record<string, string> = {
  draft: "Draft",
  pending_approval: "Pending approval",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

const statusClasses: Record<string, string> = {
  draft: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  pending_approval:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  approved:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  cancelled: "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold">Change requests</h1>
      <RouterLink
        :to="{ name: 'cr-new' }"
        class="inline-flex items-center gap-2 rounded-input bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 text-sm font-medium transition-colors duration-subtle"
      >
        <IconPlus class="w-4 h-4" /> New request
      </RouterLink>
    </div>

    <div class="mb-4 flex gap-2">
      <button
        v-for="s in [
          '',
          'draft',
          'pending_approval',
          'approved',
          'rejected',
          'cancelled',
        ]"
        :key="s"
        type="button"
        class="rounded-input px-3 py-1.5 text-sm transition-colors duration-subtle"
        :class="
          statusFilter === s
            ? 'bg-accent-600 text-white'
            : 'bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 hover:border-accent-400'
        "
        @click="statusFilter = s as ChangeRequest['status'] | ''"
      >
        {{ s === "" ? "All" : statusLabels[s] }}
      </button>
    </div>

    <div
      class="bg-white dark:bg-gray-900 rounded-card shadow-sm overflow-hidden"
    >
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-800 text-left text-gray-500">
          <tr>
            <th class="px-4 py-3">#</th>
            <th class="px-4 py-3">Title</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3">Priority</th>
            <th class="px-4 py-3">Scheduled end</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td colspan="5" class="px-4 py-8 text-center text-gray-400">
              Loading…
            </td>
          </tr>
          <tr v-else-if="!data?.length">
            <td colspan="5" class="px-4 py-8 text-center text-gray-400">
              No change requests yet.
            </td>
          </tr>
          <tr
            v-for="cr in data"
            :key="cr.id"
            class="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
            @click="$router.push({ name: 'cr-detail', params: { id: cr.id } })"
          >
            <td class="px-4 py-3 text-gray-400">{{ cr.displayId }}</td>
            <td class="px-4 py-3 font-medium">{{ cr.title }}</td>
            <td class="px-4 py-3">
              <span
                class="rounded-full px-2.5 py-0.5 text-xs font-medium"
                :class="statusClasses[cr.status]"
              >
                {{ statusLabels[cr.status] }}
              </span>
            </td>
            <td class="px-4 py-3 capitalize">{{ cr.priority }}</td>
            <td class="px-4 py-3 text-gray-500">
              {{
                cr.scheduledEnd
                  ? new Date(cr.scheduledEnd).toLocaleString()
                  : "—"
              }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
