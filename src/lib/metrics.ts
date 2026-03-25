export function sumBy<T>(items: T[], selector: (item: T) => number) {
  return items.reduce((total, item) => total + selector(item), 0);
}

export function averageBy<T>(items: T[], selector: (item: T) => number) {
  if (!items.length) return 0;
  return sumBy(items, selector) / items.length;
}

export function ratio(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return (numerator / denominator) * 100;
}

export function withinDays(value: string | Date | null | undefined, days: number, reference: Date) {
  if (!value) return false;
  const target = new Date(value);
  const windowEnd = new Date(reference);
  windowEnd.setDate(windowEnd.getDate() + days);
  return target >= reference && target <= windowEnd;
}

export function isPast(value: string | Date | null | undefined, reference: Date) {
  if (!value) return false;
  return new Date(value) < reference;
}
