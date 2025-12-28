/**
 * CSV Export Utility for Admin Dashboard
 * Handles UTF-8 encoding and proper escaping
 */

type CsvRow = Record<string, string | number | boolean | null | undefined>;

/**
 * Escapes a value for CSV format
 */
function escapeCsvValue(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return "";
  
  const stringValue = String(value);
  
  // If the value contains commas, quotes, or newlines, wrap in quotes and escape internal quotes
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Converts an array of objects to CSV format
 */
export function arrayToCsv<T extends CsvRow>(data: T[], columns: { key: keyof T; header: string }[]): string {
  // Create header row
  const headerRow = columns.map((col) => escapeCsvValue(col.header)).join(",");
  
  // Create data rows
  const dataRows = data.map((row) =>
    columns.map((col) => escapeCsvValue(row[col.key])).join(",")
  );
  
  // Combine with newlines
  return [headerRow, ...dataRows].join("\n");
}

/**
 * Triggers a CSV download in the browser
 */
export function downloadCsv(csvContent: string, filename: string): void {
  // Add UTF-8 BOM for proper encoding in Excel
  const bom = "\uFEFF";
  const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
  
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV and trigger download
 */
export function exportToCsv<T extends CsvRow>(
  data: T[],
  columns: { key: keyof T; header: string }[],
  filename: string
): void {
  const csv = arrayToCsv(data, columns);
  downloadCsv(csv, filename);
}
