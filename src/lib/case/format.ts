/** Dates on the file are shown in Boston time, wherever the reader is. */
const bostonDateTime = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const bostonDate = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  weekday: "long",
  month: "long",
  day: "numeric",
});

export function formatBostonDateTime(date: Date) {
  return `${bostonDateTime.format(date)} Boston time`;
}

export function formatBostonDate(date: Date) {
  return bostonDate.format(date);
}
