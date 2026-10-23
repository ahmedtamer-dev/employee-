/**
 * Export array of data to CSV file with UTF-8 BOM for perfect Arabic display in Excel
 * @param {string} filename - Filename without extension
 * @param {Array<Object>} rows - Data rows
 * @param {Array<{ key: string, label: string, value?: (row: any) => string }>} columns - Column definitions
 */
export function exportToCsv(filename, rows, columns) {
  if (!rows || !rows.length) return;

  const headers = columns.map((col) => `"${(col.label || col.key).replace(/"/g, '""')}"`).join(',');
  const lines = rows.map((row) =>
    columns
      .map((col) => {
        const val = typeof col.value === 'function' ? col.value(row) : row[col.key];
        const str = val === undefined || val === null ? '' : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  const csvContent = '\uFEFF' + [headers, ...lines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
