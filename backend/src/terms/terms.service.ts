// backend/src/terms/terms.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type TermDto = {
  id: number;
  term: string;
  definition: string;
};

@Injectable()
export class TermsService {
  constructor(private readonly prisma: PrismaService) {}

  async search(q: string): Promise<TermDto[]> {
    const query = (q ?? '').split('\u0000').join('').trim();

    if (query.length < 2 || query.length > 50) return [];

    return this.prisma.term.findMany({
      where: { term: { startsWith: query, mode: 'insensitive' } },
      take: 10,
      select: { id: true, term: true, definition: true },
      orderBy: { term: 'asc' },
    });
  }
}
