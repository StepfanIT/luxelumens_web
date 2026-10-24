// Holidays the lights are bought for, with the look each one plays.

const DAY = 864e5;
const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** Easter Sunday (Gregorian calendar, anonymous algorithm). */
export function easter(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function holidays(year) {
  return [
    { id: 'valentine', look: 'valentine', date: new Date(year, 1, 14), promo: true },
    { id: 'easter', look: 'easter', date: easter(year), promo: true },
    { id: 'halloween', look: 'halloween', date: new Date(year, 9, 31), promo: true },
    { id: 'independence', look: 'poland', date: new Date(year, 10, 11), promo: false },
    { id: 'christmas', look: 'christmas', date: new Date(year, 11, 24), promo: true },
  ];
}

function upcoming(now) {
  const today = startOfDay(now);
  return [...holidays(today.getFullYear()), ...holidays(today.getFullYear() + 1)]
    .map((holiday) => ({ ...holiday, days: Math.round((holiday.date - today) / DAY) }))
    .filter((holiday) => holiday.days >= 0)
    .sort((a, b) => a.days - b.days);
}

/** The next holiday worth a countdown: far enough ahead to still install for it. */
export function nextPromoHoliday(now = new Date(), lead = 21) {
  return upcoming(now).find((holiday) => holiday.promo && holiday.days >= lead) ?? null;
}

/** The look of a holiday in the next three weeks, if there is one. */
export function seasonalLook(now = new Date()) {
  return upcoming(now).find((holiday) => holiday.days <= 21)?.look ?? null;
}
