<script setup lang="ts">
// Change-request detail: lifecycle actions, participants, comments, activity
// timeline (Sprint 2, Task 2.8).
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useQuery } from "@tanstack/vue-query";
import { changeRequestApi } from "@/api/changeRequests";
import { collaborationApi } from "@/api/collaboration";
import { useToastStore } from "@/stores/toast";
import { ApiError } from "@/api/client";
import { IconCheck, IconX } from "@tabler/icons-vue";

const route = useRoute();
const toast = useToastStore();
const crId = computed(() => String(route.params.id));

const { data: cr } = useQuery({
  queryKey: ["cr", crId],
  queryFn: () => changeRequestApi.get(crId.value),
});
const { data: approvers } = useQuery({
  queryKey: ["cr-approvers", crId],
  queryFn: () => changeRequestApi.listApprovers(crId.value),
});
const { data: comments } = useQuery({
  queryKey: ["cr-comments", crId],
  queryFn: () => collaborationApi.listComments(crId.value),
});

const commentDraft = ref("");
const posting = ref(false);

async function postComment(): Promise<void> {
  if (!commentDraft.value.trim()) return;
  posting.value = true;
  try {
    await collaborationApi.addComment(crId.value, commentDraft.value);
    commentDraft.value = "";
    toast.success("Comment posted");
  } catch (err) {
    toast.error(
      err instanceof ApiError ? err.problem.message : "Failed to post comment",
    );
  } finally {
    posting.value = false;
  }
}

async function act(
  fn: () => Promise<unknown>,
  successMsg: string,
): Promise<void> {
  try {
    await fn();
    toast.success(successMsg);
  } catch (err) {
    toast.error(
      err instanceof ApiError ? err.problem.message : "Action failed",
    );
  }
}

const statusLabels: Record<string, string> = {
  draft: "Draft",
  pending_approval: "Pending approval",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};
</script>

<template>
  <div v-if="cr" class="space-y-6">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm text-gray-400">#{{ cr.displayId }}</p>
        <h1 class="text-2xl font-semibold">{{ cr.title }}</h1>
      </div>
      <div class="flex gap-2">
        <button
          v-if="cr.status === 'draft'"
          type="button"
          class="rounded-input bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 text-sm font-medium"
          @click="
            act(() => changeRequestApi.submit(cr.id), 'Submitted for approval')
          "
        >
          Submit
        </button>
        <button
          v-if="cr.status === 'approved' && cr.completionStatus === 'open'"
          type="button"
          class="rounded-input bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-medium"
          @click="
            act(() => changeRequestApi.complete(cr.id), 'Marked complete')
          "
        >
          <IconCheck class="w-4 h-4 inline" /> Complete
        </button>
        <button
          v-if="cr.status === 'draft' || cr.status === 'pending_approval'"
          type="button"
          class="rounded-input border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm"
          @click="act(() => changeRequestApi.cancel(cr.id), 'Cancelled')"
        >
          <IconX class="w-4 h-4 inline" /> Cancel
        </button>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4 text-sm">
      <div class="bg-white dark:bg-gray-900 rounded-card shadow-sm p-4">
        <p class="text-gray-400 text-xs mb-1">Status</p>
        <p class="font-medium capitalize">
          {{ statusLabels[cr.status] ?? cr.status }}
        </p>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-card shadow-sm p-4">
        <p class="text-gray-400 text-xs mb-1">Scheduled window</p>
        <p class="text-sm">
          {{
            cr.scheduledStart
              ? new Date(cr.scheduledStart).toLocaleString()
              : "—"
          }}
          →
          {{
            cr.scheduledEnd ? new Date(cr.scheduledEnd).toLocaleString() : "—"
          }}
        </p>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-card shadow-sm p-4">
        <p class="text-gray-400 text-xs mb-1">Affected systems</p>
        <p class="text-sm">{{ cr.affectedSystems.join(", ") || "—" }}</p>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-900 rounded-card shadow-sm p-6">
      <h2 class="font-semibold mb-2">Description</h2>
      <p class="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
        {{ cr.description || "—" }}
      </p>
    </div>

    <div class="bg-white dark:bg-gray-900 rounded-card shadow-sm p-6">
      <h2 class="font-semibold mb-3">Approvers</h2>
      <ul class="space-y-2 text-sm">
        <li
          v-for="a in approvers ?? []"
          :key="a.id"
          class="flex items-center justify-between"
        >
          <span>{{ a.userId.slice(0, 8) }}…</span>
          <span class="text-xs capitalize text-gray-500">{{ a.status }}</span>
        </li>
        <li v-if="!approvers?.length" class="text-gray-400">
          No approvers assigned yet.
        </li>
      </ul>
    </div>

    <div class="bg-white dark:bg-gray-900 rounded-card shadow-sm p-6">
      <h2 class="font-semibold mb-3">Comments</h2>
      <div class="space-y-3 mb-4">
        <div
          v-for="c in comments ?? []"
          :key="c.id"
          class="border-b border-gray-100 dark:border-gray-800 pb-3"
        >
          <p class="text-xs text-gray-400 mb-1">
            {{ new Date(c.createdAt).toLocaleString() }}
          </p>
          <div class="text-sm" v-html="c.body"></div>
        </div>
        <p v-if="!comments?.length" class="text-gray-400 text-sm">
          No comments yet.
        </p>
      </div>
      <div class="flex gap-2">
        <textarea
          id="cr-comment"
          v-model="commentDraft"
          rows="2"
          aria-label="Write a comment"
          placeholder="Write a comment… use @<userId> to mention"
          class="flex-1 rounded-input border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
        ></textarea>
        <button
          type="button"
          :disabled="posting"
          class="rounded-input bg-accent-600 hover:bg-accent-700 disabled:opacity-50 text-white px-4 text-sm font-medium"
          @click="postComment"
        >
          Post
        </button>
      </div>
    </div>
  </div>
  <div v-else class="text-gray-400">Loading…</div>
</template>
