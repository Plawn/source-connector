export function prepare_date(s: string | undefined): string | undefined {
  if (s === undefined) {
    return undefined;
  }
  const d = new Date(parseFloat(s) * 1000);
  return d.toISOString();
}
