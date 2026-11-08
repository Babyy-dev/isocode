export type CsvCell = string | number | boolean | null;

/** RFC 4180 CSV with CRLF line endings, safe to open in Excel. */
export function toCsv(header: string[], rows: CsvCell[][]): string {
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

export function csvCell(value: CsvCell): string {
  if (value === null) return "";
  let text = String(value);
  // A leading = + - @ (or tab/CR) makes spreadsheets run the cell as a formula.
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]|^\s|\s$/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}
