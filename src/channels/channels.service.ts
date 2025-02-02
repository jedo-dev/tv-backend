import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TvProgramms } from 'src/tv-programms/tv-programms.schema';
import { Channels } from './channels.schema';
@Injectable()
export class ChannelsService {
  constructor(
    @InjectModel('Channels') private readonly channelsModel: Model<Channels>,
    @InjectModel('TvProgramms')
    private readonly tvProgrammsModel: Model<TvProgramms>,
  ) {}

  /**
   * Получить канал со всеми связанными программами.
   * @param channelId ID канала
   * @returns Канал со списком программ
   */
  async getChannelWithPrograms(channelId: number): Promise<any> {
    try {
      // Агрегация для связи каналов и программ
      console.log(channelId)
      const result = await this.channelsModel.aggregate([
        {
          $match: { id: +channelId }, // Фильтрация по ID канала
        },
        {
          $lookup: {
            from: 'tvprogramms', // Имя коллекции программ в MongoDB
            localField: 'id', // Поле в коллекции каналов
            foreignField: 'channel', // Поле в коллекции программ
            as: 'programms', // Имя результирующего поля
          },
        },
      ]);

      if (result.length === 0) {
        throw new Error(`Канал с ID ${channelId} не найден.`);
      }

      return result[0]; // Возвращаем первый (и единственный) результат
    } catch (error) {
      throw new Error(`Ошибка при получении данных: ${error.message}`);
    }
  }
  async create(tvProgramData: Partial<Channels>): Promise<Channels> {
    const newProgram = new this.channelsModel(tvProgramData);
    return newProgram.save();
  }
  /**
   * Получить каналы с фильтрацией, пагинацией и текущими программами.
   * @param query Объект с параметрами фильтрации и пагинации
   * @returns Список каналов с пагинацией и текущими программами
   */
  async findAll(query: {
    name?: string;
    currentStart?: Date;
    currentEnd?: Date;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const { name, currentStart, currentEnd, page = 1, limit = 10 } = query;

    try {
      // Фильтр для поиска каналов
      const channelFilter: any = {};
      if (name) {
        channelFilter.name = { $regex: name, $options: 'i' }; // Поиск по имени (регистронезависимый)
      }

      // Поиск текущих программ
      const currentProgramsFilter: any = {};
      if (currentStart && currentEnd) {
        currentProgramsFilter.start = { $lte: currentEnd }; // Программа начинается до конца интервала
        currentProgramsFilter.stop = { $gte: currentStart }; // Программа заканчивается после начала интервала
      }

      const skip = (page - 1) * limit; // Пропустить записи для пагинации

      // Агрегация для получения каналов с текущими программами
      const result = await this.channelsModel.aggregate([
        { $match: channelFilter }, // Фильтрация каналов
        {
          $lookup: {
            from: 'tvprogramms', // Коллекция телепрограмм
            localField: 'id', // Поле в коллекции каналов
            foreignField: 'channel', // Поле в коллекции телепрограмм
            as: 'programms', // Поле для результатов
          },
        },
        {
          $addFields: {
            currentProgram: {
              $filter: {
                input: '$programms',
                as: 'program',
                cond: {
                  $and: [
                    { $lte: ['$$program.start', currentEnd] },
                    { $gte: ['$$program.stop', currentStart] },
                  ],
                },
              },
            },
          },
        },
        { $unset: 'programms' }, // Убираем лишнее поле программ
        { $skip: skip }, // Пропустить записи
        { $limit: limit }, // Лимит записей
      ]);

      // Общее количество записей (для пагинации)
      const totalCount = await this.channelsModel.countDocuments(channelFilter);

      return {
        data: result,
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      };
    } catch (error) {
      throw new Error(`Ошибка при выполнении findAll: ${error.message}`);
    }
  }
  async parseData(): Promise<any> {
    const fetchAndProcessEPG = async (url: string) => {
      try {
        const response = await fetch(url);
        const pako: any = require('pako');
        const { DOMParser }: any = require('xmldom');
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
        const data: Partial<Channels>[] = [];
        const channels = xmlDoc.getElementsByTagName('channel');
        for (let i = 0; i < channels.length; i++) {
          const channel = channels[i];
          const idStr = channel.getAttribute('id'); // id из XML — это строка или null

          // Проверка, что id существует и его можно преобразовать в число
          if (!idStr || isNaN(Number(idStr))) {
            console.warn(`Invalid or missing id for channel at index ${i}`);
            continue; // Пропускаем канал, если id невалиден
          }

          const id = Number(idStr); // Преобразование строки в число
          const name =
            channel.getElementsByTagName('display-name')[0]?.textContent ?? '';
          const lang = channel
            .getElementsByTagName('display-name')[0]
            ?.getAttribute('lang');
          const icon =
            channel.getElementsByTagName('icon')[0]?.getAttribute('src') ?? '';

          // Добавляем данные только для каналов с lang === 'ru'
          if (lang === 'ru') {
            data.push({
              id: id, // Обязательно число
              name: name,
              icon: icon,
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
            console.log(`Канал сохранён: ${channel.name}`);
          } catch (error) {
            console.error(`Ошибка сохранения канала: ${channel.name}`, error);
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
