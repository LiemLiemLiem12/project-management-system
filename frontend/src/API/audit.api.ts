import { AxiosInstance } from "axios";

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value: any;
  new_value: any;
  status: string;
  created_at: string;
}

export interface AuditLogResponse {
  data: AuditLog[];
  total: number;
  limit: number;
  offset: number;
}

export const auditApi = (axiosPrivate: AxiosInstance) => ({
  getRecentLogs: (projectId: string) =>
    axiosPrivate.get<AuditLog[]>(`/tasks/recent-activities/${projectId}`),

  getFeedActivities: (projectIds: string[]) => {
    return axiosPrivate.post<AuditLog[]>("/tasks/recent-activities/feed", {
      projectIds,
    });
  },

  /**
   * Get audit logs by any supported field with pagination
   * Supports fields: project_id, user_id, action, entity_type, entity_id
   */
  getLogsByField: (field: string, value: string, limit?: number, offset?: number) =>
    axiosPrivate.get<AuditLogResponse>(`/audit/logs`, {
      params: {
        field,
        value,
        limit: limit || 10,
        offset: offset || 0,
      },
    }),

  /**
   * Create a new audit log
   */
  createAuditLog: (payload: {
    project_id?: string;
    user_id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    old_value?: any;
    new_value?: any;
    status?: string;
  }) => axiosPrivate.post<AuditLog>(`/audit/logs`, payload),
});
