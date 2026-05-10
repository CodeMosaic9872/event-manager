import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSavedConceptDto } from './dto/saved-concept.dto';

@Injectable()
export class ConceptsService {
  constructor(private readonly prisma: PrismaService) {}

  private toPagination(page?: number, limit?: number) {
    const safePage = Number.isFinite(page) && (page as number) > 0 ? Math.floor(page as number) : 1;
    const safeLimit = Number.isFinite(limit) && (limit as number) > 0 ? Math.min(200, Math.floor(limit as number)) : 20;
    return { skip: (safePage - 1) * safeLimit, take: safeLimit };
  }

  listForUser(userId: string, page?: number, limit?: number) {
    const pg = this.toPagination(page, limit);
    const where = { userId };
    return this.prisma.$transaction([
      this.prisma.savedEventConcept.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pg.skip,
        take: pg.take,
      }),
      this.prisma.savedEventConcept.count({ where }),
    ]).then(([items, totalItems]) => ({ items, totalItems }));
  }

  createForUser(userId: string, dto: CreateSavedConceptDto) {
    return this.prisma.savedEventConcept.create({
      data: {
        userId,
        title: dto.title?.trim() || null,
        content: dto.content.trim(),
        sourceConversationId: dto.sourceConversationId?.trim() || null,
      },
    });
  }

  async deleteForUser(userId: string, id: string) {
    const row = await this.prisma.savedEventConcept.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!row) {
      throw new NotFoundException('Saved concept not found');
    }
    await this.prisma.savedEventConcept.delete({ where: { id: row.id } });
    return { deleted: true as const };
  }
}
