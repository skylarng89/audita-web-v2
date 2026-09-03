import { request } from "./client";

// Collaboration API surface mirroring internal/collaboration/handler.go.

export interface Comment {
  id: string;
  changeRequestId: string;
  authorId: string;
  body: string;
  mentions?: string[];
  createdAt: string;
}

export interface Attachment {
  id: string;
  changeRequestId: string;
  uploaderId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface ActivityEntry {
  id: string;
  changeRequestId: string;
  actorId: string;
  actionType: string;
  payload: Record<string, unknown>;
  occurredAt: string;
}

export const collaborationApi = {
  listComments(crId: string): Promise<Comment[]> {
    return request<Comment[]>(`/api/v1/change-requests/${crId}/comments`);
  },

  addComment(crId: string, body: string): Promise<Comment> {
    return request<Comment>(`/api/v1/change-requests/${crId}/comments`, {
      method: "POST",
      body: { body },
    });
  },

  listAttachments(crId: string): Promise<Attachment[]> {
    return request<Attachment[]>(`/api/v1/change-requests/${crId}/attachments`);
  },

  listActivity(crId: string): Promise<ActivityEntry[]> {
    return request<ActivityEntry[]>(`/api/v1/change-requests/${crId}/activity`);
  },

  attachmentDownloadUrl(crId: string, attachmentId: string): string {
    return `/api/v1/change-requests/${crId}/attachments/${attachmentId}/download`;
  },
};
