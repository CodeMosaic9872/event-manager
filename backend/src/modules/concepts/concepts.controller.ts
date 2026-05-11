import { Body, Controller, Delete, Get, Param, Post, Query, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiProtectedErrors } from '../../common/swagger/api-error-responses.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ConceptsService } from './concepts.service';
import {
  CreateSavedConceptDto,
  DeleteConceptResponseDto,
  SavedConceptListResponseDto,
  SavedConceptResponseDto,
} from './dto/saved-concept.dto';

@ApiTags('User Concepts')
@ApiProtectedErrors()
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('users/me/concepts')
export class ConceptsController {
  constructor(private readonly conceptsService: ConceptsService) {}

  @Get()
  @ApiOperation({ summary: 'List saved / liked event concepts for the current user' })
  @ApiOkResponse({
    description: 'Paginated saved concepts',
    type: SavedConceptListResponseDto,
  })
  list(@CurrentUser() user: AuthUser | undefined, @Query() query: PaginationQueryDto) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.conceptsService.listForUser(userId, query.page, query.limit);
  }

  @Post()
  @ApiOperation({ summary: 'Save a new event concept for the current user' })
  @ApiCreatedResponse({ type: SavedConceptResponseDto })
  create(@CurrentUser() user: AuthUser | undefined, @Body() body: CreateSavedConceptDto) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.conceptsService.createForUser(userId, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a saved concept' })
  @ApiOkResponse({ type: DeleteConceptResponseDto })
  remove(@CurrentUser() user: AuthUser | undefined, @Param('id') id: string) {
    const userId = user?.id;
    if (!userId || userId.startsWith('anonymous:')) {
      throw new UnauthorizedException('Authenticated user required');
    }
    return this.conceptsService.deleteForUser(userId, id);
  }
}
