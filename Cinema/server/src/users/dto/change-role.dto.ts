import { IsNumber } from 'class-validator';

export class ChangeRoleDto {
  @IsNumber()
  roleId: number;
}
