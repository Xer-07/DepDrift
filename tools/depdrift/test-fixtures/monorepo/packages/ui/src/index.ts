import { formatDate } from "@demo/utils";

export function renderDate(date: Date): string {
  return `<div>${formatDate(date)}</div>`;
}
