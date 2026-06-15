import { Controller, Get, Put, Param, Query, Body, UseGuards, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ChangeRoleDto } from './dto/change-role.dto';

@Controller('api/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.usersService.findAll(page, limit);
  }

  @Put(':id/role')
  changeRole(@Param('id', ParseIntPipe) id: number, @Body() changeRoleDto: ChangeRoleDto) {
    return this.usersService.changeRole(id, changeRoleDto);
  }
}
