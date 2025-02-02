import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Channels } from './channels.schema';
import { ChannelsService } from './channels.service';
import { query } from 'express';
@Controller('channels')
export class ChannelsController {
  constructor(private readonly ChannelsService: ChannelsService) {}
  @Post()
  create(@Body() ChannelsData: Partial<Channels>) {
    return this.ChannelsService.create(ChannelsData);
  }
  @Get(':id')
   getChannelWithPrograms(@Param('id') id: number) {
    return this.ChannelsService.getChannelWithPrograms(id);
  }
  @Get()
   findAll(
    @Query('name') name?: string, // Фильтрация по имени канала
    @Query('currentStart') currentStart?: string, // Начало временного интервала
    @Query('currentEnd') currentEnd?: string, // Конец временного интервала
    @Query('page') page = 1, // Номер страницы (по умолчанию 1)
    @Query('limit') limit = 10, // Лимит записей на страницу (по умолчанию 10)
  ) {
    // Преобразуем currentStart и currentEnd в Date (если переданы)
    const currentStartDate = currentStart ? new Date(currentStart) : undefined;
    const currentEndDate = currentEnd ? new Date(currentEnd) : undefined;

    return this.ChannelsService.findAll({
      name,
      currentStart: currentStartDate,
      currentEnd: currentEndDate,
      page: Number(page),
      limit: Number(limit),
    });
  }
  @Get('parse')
  getHello(): any {
    return this.ChannelsService.parseData();
  }
}
