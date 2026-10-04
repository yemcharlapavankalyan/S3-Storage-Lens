/**
 * Utility functions for byte formatting and currency display
 */

export function formatBytes(bytes?: number | null): string {
  if (bytes === null || bytes === undefined || isNaN(bytes) || bytes === 0) {
    return '0 B';
  }
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  const val = bytes / Math.pow(k, i);
  return `${val.toFixed(val >= 100 || i === 0 ? 0 : 2)} ${sizes[i]}`;
}

export function formatCurrency(amount?: number | null): string {
  if (amount === null || amount === undefined || isNaN(amount) || amount === 0) {
    return '$0.00';
  }
  if (amount < 0.01) {
    return '< $0.01';
  }
  return `$${amount.toFixed(2)}`;
}
