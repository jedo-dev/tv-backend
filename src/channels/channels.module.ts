import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChannelsSchema } from './channels.schema';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { TvProgrammsModule } from 'src/tv-programms/tv-programms.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Channels', schema: ChannelsSchema }]),
    TvProgrammsModule
  ],
  providers: [ChannelsService],
  controllers: [ChannelsController],
})
export class ChannelsModule {}
