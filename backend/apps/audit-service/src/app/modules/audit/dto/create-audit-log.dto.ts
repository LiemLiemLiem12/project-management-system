export class CreateAuditLogDto {
  project_id?: string;
  user_id!: string; // Required
  action!: string; // Required
  entity_type!: string; // Required
  entity_id!: string; // Required
  old_value?: any;
  new_value?: any;
  status?: string;
}
