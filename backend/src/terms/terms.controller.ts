import { Controller, Get, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { TermsService, TermDto } from './terms.service';

@Controller('terms')
export class TermsController {
  constructor(private readonly terms: TermsService) {}

  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Get('search')
  async search(@Query('q') q = ''): Promise<TermDto[]> {
    return this.terms.search(q);
  }
}
