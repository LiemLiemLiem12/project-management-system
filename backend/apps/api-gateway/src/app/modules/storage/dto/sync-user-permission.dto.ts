import { IsArray, IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { AssetPermission } from '../enums/asset-permission.enum';

export class SyncUserPermissionDto {
  @IsNotEmpty()
  @IsString()
  fileId!: string;

  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsNotEmpty()
  @IsArray()
  @IsEnum(AssetPermission, { each: true })
  newPermissions!: AssetPermission[];
}
