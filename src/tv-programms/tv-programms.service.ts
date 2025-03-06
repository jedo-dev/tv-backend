import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { parseEPGDate } from 'src/utils';
import { TvProgramms } from './tv-programms.schema';

@Injectable()
export class TvProgrammsService {
  constructor(
    @InjectModel('TvProgramms')
    private readonly tvProgrammsModel: Model<TvProgramms>,
  ) {}
  async create(tvProgramData: Partial<TvProgramms>): Promise<TvProgramms> {
    const newProgram = new this.tvProgrammsModel(tvProgramData);
    return newProgram.save();
  }
  async findAll(): Promise<TvProgramms[]> {
    const collections = this.tvProgrammsModel.db.collections;
    console.log(`collections`, collections);
    return this.tvProgrammsModel.find().exec();
  }

  async parseData(): Promise<any> {
    const fetchAndProcessEPG = async (url: string) => {
      try {
        const pako: any = require('pako');
        const { DOMParser }: any = require('xmldom');
        const response = await fetch(url);

        console.log('response', response);
        if (!response.ok) {
          throw new Error(`HTTP ошибка: ${response.status}`);
        }
        const compressedData = await response.arrayBuffer();

        // Шаг 2: Распаковка .gz с помощью pako
        const decompressedData = pako.ungzip(new Uint8Array(compressedData), {
          to: 'string',
        });

        // Шаг 3: Парсинг XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(decompressedData, 'text/xml');
        // Шаг 2: Распаковка .gz с помощью pako
        const data: Partial<TvProgramms>[] = [];
        const programs = xmlDoc.getElementsByTagName('programme');
        for (let i = 0; i < programs.length; i++) {
          const program = programs[i];
          const start = parseEPGDate(program.getAttribute('start') ?? '');
          const stop = parseEPGDate(program.getAttribute('stop') ?? '');

          const channel = +program.getAttribute('channel') || 0;
          const title =
            program.getElementsByTagName('title')[0]?.textContent || '';
          const description =
            program.getElementsByTagName('desc')[0]?.textContent || '';
          const category =
            program.getElementsByTagName('category')[0]?.textContent || '';
          const lang =
            program.getElementsByTagName('title')[0]?.getAttribute('lang') ||
            '';

          const seenChannels = new Set<number>([353, 323, 79, 1649, 1322,1037,821]); // Сет для хранения каналов
          if (channel && seenChannels.has(channel)){
            data.push({
              start,
              stop,
              channel,
              title,
              description,
              category,
              lang,
            });
          }
        }
        // Пример: Извлечение данных о программах
        // const programs = xmlDoc.getElementsByTagName('programme');
        // for (let i = 0; i < programs.length; i++) {
        //   const program = programs[i];
        //   const startTime = program.getAttribute('start');
        //   const stopTime = program.getAttribute('stop');
        //   const title = program.getElementsByTagName('title')[0]?.textContent;

        //   console.log(
        //     `Начало: ${startTime}, Конец: ${stopTime}, Название: ${title}`,
        //   );
        // }

        for (const channel of data) {
          try {
            await this.create(channel);
          } catch (error) {
            console.error(`Ошибка сохранения канала: `, error);
          }
        }
      } catch (error) {
        console.error('Ошибка обработки EPG:', error);
      }
    };

    // URL файла EPG
    const epgUrl = 'http://epg.one/ru2.xml.gz';

    // Запуск функции
    await fetchAndProcessEPG(epgUrl);
  }
}
