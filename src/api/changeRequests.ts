import { request } from "./client";

// Change-request API surface mirroring internal/changerequest/handler.go.

export type CRStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "cancelled";
export type Priority = "low" | "medium" | "high";

export interface ChangeRequest {
  id: string;
  displayId: number;
  title: string;
  description: string;
  status: CRStatus;
  completionStatus: "open" | "completed";
  priority: Priority;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  affectedSystems: string[];
  slaBreached: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Approver {
  id: string;
  changeRequestId: string;
  userId: string;
  status: "pending" | "approved" | "rejected";
  decidedAt: string | null;
}

export interface Watcher {
  id: string;
  changeRequestId: string;
  userId: string;
}

export interface Participant {
  id: string;
  fullName: string;
  email: string;
}

export interface CRInput {
  title: string;
  description: string;
  priority?: Priority;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  affectedSystems?: string[];
  requestDepartmentId?: string | null;
  destinationDepartmentId?: string | null;
}

export const changeRequestApi = {
  list(status?: CRStatus): Promise<ChangeRequest[]> {
    const qs = status ? `?status=${encodeURIComponent(status)}` : "";
    return request<ChangeRequest[]>(`/api/v1/change-requests${qs}`);
  },

  get(id: string): Promise<ChangeRequest> {
    return request<ChangeRequest>(`/api/v1/change-requests/${id}`);
  },

  create(input: CRInput): Promise<ChangeRequest> {
    return request<ChangeRequest>("/api/v1/change-requests", {
      method: "POST",
      body: input,
    });
  },

  update(id: string, input: Partial<CRInput>): Promise<ChangeRequest> {
    return request<ChangeRequest>(`/api/v1/change-requests/${id}`, {
      method: "PATCH",
      body: input,
    });
  },

  submit(id: string): Promise<ChangeRequest> {
    return request<ChangeRequest>(`/api/v1/change-requests/${id}/submit`, {
      method: "POST",
    });
  },

  complete(id: string): Promise<ChangeRequest> {
    return request<ChangeRequest>(`/api/v1/change-requests/${id}/complete`, {
      method: "POST",
    });
  },

  cancel(id: string): Promise<ChangeRequest> {
    return request<ChangeRequest>(`/api/v1/change-requests/${id}/cancel`, {
      method: "POST",
    });
  },

  addApprover(id: string, userId: string): Promise<Approver> {
    return request<Approver>(`/api/v1/change-requests/${id}/approvers`, {
      method: "POST",
      body: { userId },
    });
  },

  addApproverGroup(id: string, groupId: string): Promise<void> {
    return request<void>(`/api/v1/change-requests/${id}/approver-groups`, {
      method: "POST",
      body: { groupId },
    });
  },

  addWatcher(id: string, userId: string): Promise<Watcher> {
    return request<Watcher>(`/api/v1/change-requests/${id}/watchers`, {
      method: "POST",
      body: { userId },
    });
  },

  decide(
    id: string,
    approverId: string,
    approve: boolean,
    rejectionReason?: string,
    decisionComment?: string,
  ): Promise<ChangeRequest> {
    return request<ChangeRequest>(
      `/api/v1/change-requests/${id}/approvers/${approverId}/decision`,
      {
        method: "POST",
        body: { approve, rejectionReason, decisionComment },
      },
    );
  },

  approverCandidates(id: string): Promise<Participant[]> {
    return request<Participant[]>(
      `/api/v1/change-requests/${id}/approver-candidates`,
    );
  },

  listApprovers(id: string): Promise<Approver[]> {
    return request<Approver[]>(`/api/v1/change-requests/${id}/approvers`);
  },

  listWatchers(id: string): Promise<Watcher[]> {
    return request<Watcher[]>(`/api/v1/change-requests/${id}/watchers`);
  },
};
