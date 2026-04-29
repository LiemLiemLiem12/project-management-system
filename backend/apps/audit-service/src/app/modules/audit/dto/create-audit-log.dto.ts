export class CreateAuditLogDto {
  user_id?: string;
  action?: string;
  entity_type?: string;
  entity_id?: string;
  old_value?: any;
  new_value?: any;
  status?: string;
}
