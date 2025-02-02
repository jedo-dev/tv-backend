import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TvProgrammsController } from './tv-programms.controller';
import { TvProgrammsSchema } from './tv-programms.schema';
import { TvProgrammsService } from './tv-programms.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'TvProgramms', schema: TvProgrammsSchema },
    ]),
  ],
  providers: [TvProgrammsService],
  exports: [MongooseModule],
  controllers: [TvProgrammsController],
})
export class TvProgrammsModule {}
