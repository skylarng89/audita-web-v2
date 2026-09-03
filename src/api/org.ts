import { request } from "./client";

// Org-structure API surface mirroring internal/orgstructure/handler.go.

export interface Group {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  displayOrder: number;
  memberCount: number;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  fullName: string;
  email: string;
}

export interface Department {
  id: string;
  name: string;
  code?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface CustomFieldDefinition {
  id: string;
  label: string;
  fieldType: "text" | "number" | "select" | "multiselect" | "date" | "boolean";
  options: string[];
  required: boolean;
  displayOrder: number;
}

export const orgApi = {
  listGroups(): Promise<Group[]> {
    return request<Group[]>("/api/v1/groups");
  },

  createGroup(
    name: string,
    description: string,
    displayOrder = 0,
  ): Promise<Group> {
    return request<Group>("/api/v1/groups", {
      method: "POST",
      body: { name, description, displayOrder },
    });
  },

  updateGroup(id: string, input: Partial<Group>): Promise<void> {
    return request<void>(`/api/v1/groups/${id}`, {
      method: "PUT",
      body: input,
    });
  },

  deleteGroup(id: string): Promise<void> {
    return request<void>(`/api/v1/groups/${id}`, { method: "DELETE" });
  },

  listMembers(groupId: string): Promise<GroupMember[]> {
    return request<GroupMember[]>(`/api/v1/groups/${groupId}/members`);
  },

  addMember(groupId: string, userId: string): Promise<GroupMember> {
    return request<GroupMember>(`/api/v1/groups/${groupId}/members`, {
      method: "POST",
      body: { userId },
    });
  },

  removeMember(groupId: string, userId: string): Promise<void> {
    return request<void>(`/api/v1/groups/${groupId}/members/${userId}`, {
      method: "DELETE",
    });
  },

  listDepartments(): Promise<Department[]> {
    return request<Department[]>("/api/v1/settings/departments");
  },

  createDepartment(
    name: string,
    code: string,
    displayOrder = 0,
  ): Promise<Department> {
    return request<Department>("/api/v1/settings/departments", {
      method: "POST",
      body: { name, code, displayOrder },
    });
  },

  deleteDepartment(id: string): Promise<void> {
    return request<void>(`/api/v1/settings/departments/${id}`, {
      method: "DELETE",
    });
  },

  listCustomFields(): Promise<CustomFieldDefinition[]> {
    return request<CustomFieldDefinition[]>("/api/v1/admin/custom-fields");
  },

  createCustomField(
    def: Omit<CustomFieldDefinition, "id">,
  ): Promise<CustomFieldDefinition> {
    return request<CustomFieldDefinition>("/api/v1/admin/custom-fields", {
      method: "POST",
      body: def,
    });
  },

  deleteCustomField(id: string): Promise<void> {
    return request<void>(`/api/v1/admin/custom-fields/${id}`, {
      method: "DELETE",
    });
  },
};
