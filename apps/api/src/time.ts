function offsetMs(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

/** Converteix una data i hora locals del club (p. ex. Europe/Madrid) a un instant absolut. */
export function localToInstant(date: string, time: string, timeZone: string): Date {
  const naive = new Date(`${date}T${time.slice(0, 5)}:00Z`);
  const first = new Date(naive.getTime() - offsetMs(naive, timeZone));
  const second = offsetMs(first, timeZone);
  return new Date(naive.getTime() - second);
}

/** Data local (YYYY-MM-DD) d'un instant en una zona horària. */
export function instantToLocalDate(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(instant);
}
