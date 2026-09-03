<script setup lang="ts">
// Audit trail viewer with chain-verify indicator + export request
// (Sprint 4, Task 4.5).
import { ref } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { auditApi, type VerifyResult } from "@/api/audit";
import { useToastStore } from "@/stores/toast";
import { IconShieldCheck, IconDownload } from "@tabler/icons-vue";

const toast = useToastStore();
const verifyResult = ref<VerifyResult | null>(null);
const verifying = ref(false);

const { data, isLoading } = useQuery({
  queryKey: ["audit-trail"],
  queryFn: () => auditApi.list({ limit: 200 }),
});

async function verify(): Promise<void> {
  verifying.value = true;
  try {
    verifyResult.value = await auditApi.verify();
    if (verifyResult.value.valid) {
      toast.success(
        `Chain verified (${verifyResult.value.totalEntries} entries)`,
      );
    } else {
      toast.error(
        `Chain broken at index ${verifyResult.value.brokenAtIndex}: ${verifyResult.value.reason}`,
      );
    }
  } finally {
    verifying.value = false;
  }
}

async function requestExport(): Promise<void> {
  const req = await auditApi.requestExport({ limit: 500 });
  toast.success(`Export queued (${req.id.slice(0, 8)}…) — poll for status`);
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold">Audit trail</h1>
      <div class="flex gap-2">
        <button
          type="button"
          :disabled="verifying"
          class="inline-flex items-center gap-2 rounded-input border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm hover:border-accent-400"
          @click="verify"
        >
          <IconShieldCheck class="w-4 h-4" />
          {{ verifying ? "Verifying…" : "Verify chain" }}
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-input bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 text-sm font-medium"
          @click="requestExport"
        >
          <IconDownload class="w-4 h-4" /> Export CSV
        </button>
      </div>
    </div>

    <div
      v-if="verifyResult"
      class="mb-4 rounded-card p-4 text-sm"
      :class="
        verifyResult.valid
          ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300'
          : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      "
    >
      <template v-if="verifyResult.valid">
        ✓ Chain valid — {{ verifyResult.totalEntries }} entries verified.
      </template>
      <template v-else>
        ✗ Chain broken at index {{ verifyResult.brokenAtIndex }}:
        {{ verifyResult.reason }}
      </template>
    </div>

    <div
      class="bg-white dark:bg-gray-900 rounded-card shadow-sm overflow-hidden"
    >
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-800 text-left text-gray-500">
          <tr>
            <th class="px-4 py-3">#</th>
            <th class="px-4 py-3">When</th>
            <th class="px-4 py-3">Action</th>
            <th class="px-4 py-3">Entity</th>
            <th class="px-4 py-3">Actor</th>
            <th class="px-4 py-3">Hash</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td colspan="6" class="px-4 py-8 text-center text-gray-400">
              Loading…
            </td>
          </tr>
          <tr
            v-for="e in data ?? []"
            :key="e.id"
            class="border-t border-gray-100 dark:border-gray-800"
          >
            <td class="px-4 py-2 text-gray-400">{{ e.chainIndex }}</td>
            <td class="px-4 py-2 text-gray-500">
              {{ new Date(e.occurredAt).toLocaleString() }}
            </td>
            <td class="px-4 py-2 font-mono text-xs">{{ e.actionType }}</td>
            <td class="px-4 py-2">{{ e.entityType }}</td>
            <td class="px-4 py-2 text-gray-500">
              {{ e.actorEmail || e.actorId?.slice(0, 8) || "system" }}
            </td>
            <td class="px-4 py-2 font-mono text-xs text-gray-400">
              {{ e.recordHash.slice(0, 12) }}…
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
