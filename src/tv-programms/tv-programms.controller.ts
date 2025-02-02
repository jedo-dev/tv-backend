import { Body, Controller, Get, Post } from '@nestjs/common';
import { TvProgramms } from './tv-programms.schema';
import { TvProgrammsService } from './tv-programms.service';
@Controller('tv-program')
export class TvProgrammsController {
  constructor(private readonly TvProgrammsService: TvProgrammsService) {}
  @Post()
  create(@Body() tvProgramData: Partial<TvProgramms>) {
    return this.TvProgrammsService.create(tvProgramData);
  }

  @Get()
  findAll() {
    return this.TvProgrammsService.findAll();
  }
  @Get('parse')
  getHello(): any {
    return this.TvProgrammsService.parseData();
  }
}
