import { SetMetadata } from '@nestjs/common';
import { AssetPermission } from '../enums/asset-permission.enum';

export const PERMISSION_KEY = 'AssetPermission';

export const AssetPermissionGrant = (
  ...permission: [AssetPermission, ...AssetPermission[]]
) => SetMetadata(PERMISSION_KEY, permission);
