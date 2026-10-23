export default function Table({ columns = [], rows = [], getKey, empty = 'لا توجد بيانات لعرضها', rowClassName }) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const safeColumns = Array.isArray(columns) ? columns : [];
  const template = safeColumns.map((column) => column.width || '1fr').join(' ');

  if (!safeRows.length) {
    return <div className="table__empty">{empty}</div>;
  }

  return (
    <div className="table">
      <div className="table__head" style={{ gridTemplateColumns: template }}>
        {columns.map((column) => (
          <span key={column.key} className={column.align ? `is-${column.align}` : ''}>
            {column.label}
          </span>
        ))}
      </div>

      {rows.map((row, index) => (
        <div
          key={getKey ? getKey(row) : row.id || index}
          className={`table__row ${rowClassName ? rowClassName(row) : ''}`}
          style={{ gridTemplateColumns: template }}
        >
          {columns.map((column) => (
            <div
              key={column.key}
              className={`table__cell ${column.align ? `is-${column.align}` : ''} ${
                column.number ? 'table__cell--number' : ''
              }`}
            >
              {column.render ? column.render(row) : row[column.key]}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
