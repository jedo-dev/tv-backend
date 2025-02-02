export const parseEPGDate = (dateString: string): Date => {
  const [dateTime, offset] = dateString.split(' '); // Разделяем дату и часовой пояс
  const year = parseInt(dateTime.slice(0, 4), 10); // Год
  const month = parseInt(dateTime.slice(4, 6), 10) - 1; // Месяц (0-11)
  const day = parseInt(dateTime.slice(6, 8), 10); // День
  const hours = parseInt(dateTime.slice(8, 10), 10); // Часы
  const minutes = parseInt(dateTime.slice(10, 12), 10); // Минуты
  const seconds = parseInt(dateTime.slice(12, 14), 10); // Секунды

  // Парсим часовой пояс
  const timezoneOffsetMinutes =
    parseInt(offset.slice(1, 3), 10) * 60 + parseInt(offset.slice(3, 5), 10);
  const totalOffsetMinutes = offset.startsWith('+')
    ? -timezoneOffsetMinutes
    : timezoneOffsetMinutes;

  // Создаем объект даты
  const date = new Date(Date.UTC(year, month, day, hours, minutes, seconds));

  // Применяем часовой пояс
  date.setMinutes(date.getMinutes() + totalOffsetMinutes);

  return date;
};
