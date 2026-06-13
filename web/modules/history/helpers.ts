export function getTransactionAction(transaction: any): any {
  return transaction?.action ?? transaction?.__typename ?? null;
}

export function getTransactionId(transaction: any): string {
  return String(transaction?.id ?? transaction?.txHash ?? transaction?.hash ?? '');
}

export function unixTimestampToFormattedTime(
  input: number | { unixTimestamp: number },
  _locale?: string
): string {
  const unixTimestamp = typeof input === 'number' ? input : input.unixTimestamp;
  return new Date(unixTimestamp * 1000).toLocaleString();
}

export function getExplorerLink(_txHash: any, _chainId: any): string {
  return '#';
}

export function downloadData(filename: string, content: string, mimeType: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function formatTransactionData({ data, csv }: { data: any[]; csv: boolean }): string {
  if (csv) {
    return data.map((item) => JSON.stringify(item)).join('\n');
  }

  return JSON.stringify(data, null, 2);
}

export function groupByDate<T extends { timestamp?: string }>(items: T[]): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const date = item.timestamp ? new Date(item.timestamp).toISOString().slice(0, 10) : 'unknown';
    (acc[date] ??= []).push(item);
    return acc;
  }, {});
}
