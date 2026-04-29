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

export const auditApi = (axiosPrivate: AxiosInstance) => ({
  // Nhớ thay đường dẫn này khớp với route bên BE của ông
  getRecentLogs: () => axiosPrivate.get<AuditLog[]>(`/tasks/recent-activities`),
});
