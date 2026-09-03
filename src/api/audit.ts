import { request } from "./client";

// Audit-trail API surface mirroring internal/audit/handler.go.

export interface AuditEntry {
  id: string;
  chainIndex: number;
  recordHash: string;
  previousHash: string;
  actorId: string | null;
  actorEmail?: string;
  actionType: string;
  entityType: string;
  entityId: string | null;
  payload: Record<string, unknown>;
  occurredAt: string;
}

export interface VerifyResult {
  totalEntries: number;
  valid: boolean;
  brokenAtIndex?: number;
  reason?: string;
  verifiedAt: string;
}

export interface ExportRequest {
  id: string;
  requestedBy: string;
  filters: Record<string, unknown>;
  status: "pending" | "ready" | "failed" | "expired";
  filePath?: string;
  error?: string;
  createdAt: string;
}

export const auditApi = {
  list(
    filters: { actorId?: string; entityType?: string; limit?: number } = {},
  ): Promise<AuditEntry[]> {
    const params = new URLSearchParams();
    if (filters.actorId) params.set("actorId", filters.actorId);
    if (filters.entityType) params.set("entityType", filters.entityType);
    if (filters.limit) params.set("limit", String(filters.limit));
    const qs = params.toString();
    const path = qs ? `/api/v1/audit-trail?${qs}` : "/api/v1/audit-trail";
    return request<AuditEntry[]>(path);
  },

  verify(): Promise<VerifyResult> {
    return request<VerifyResult>("/api/v1/audit-trail/verify", {
      method: "POST",
    });
  },

  requestExport(filters: Record<string, unknown> = {}): Promise<ExportRequest> {
    return request<ExportRequest>("/api/v1/audit-trail/export", {
      method: "POST",
      body: filters,
    });
  },

  exportStatus(exportId: string): Promise<ExportRequest> {
    return request<ExportRequest>(`/api/v1/audit-trail/export/${exportId}`);
  },
};
