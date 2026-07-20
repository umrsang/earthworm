import { Body, Controller, Delete, Param, Put, UseGuards } from "@nestjs/common";

import { AuthGuard } from "../guards/auth.guard";
import { User, UserEntity } from "../user/user.decorators";
import { UpdateStatementDto } from "./dto/update-statement.dto";
import { StatementService } from "./statement.service";

@Controller("statement")
export class StatementController {
  constructor(private readonly statementService: StatementService) {}

  @UseGuards(AuthGuard)
  @Put(":statementId")
  async update(
    @User() user: UserEntity,
    @Param("statementId") statementId: string,
    @Body() dto: UpdateStatementDto,
  ) {
    return this.statementService.update(user.userId, statementId, dto);
  }

  @UseGuards(AuthGuard)
  @Delete(":statementId")
  async delete(@User() user: UserEntity, @Param("statementId") statementId: string) {
    return this.statementService.delete(user.userId, statementId);
  }
}
