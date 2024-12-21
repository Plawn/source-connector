export function prepare_date_slack(s: string | undefined): string | undefined {
  if (s === undefined) {
    return undefined;
  }
  const d = new Date(parseFloat(s) * 1000);
  return d.toISOString();
}

export function prepare_date_appstore(s: string): string {
  const d = new Date(s);
  return d.toISOString();
}
