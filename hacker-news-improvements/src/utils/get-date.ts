export function getDate(datetime = new Date()): string {
  return datetime.toISOString().slice(0, 10);
}
