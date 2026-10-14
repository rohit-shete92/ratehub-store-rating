export default function DataTable({ columns, rows, sortBy, sortOrder, onSort, emptyMessage = 'No records found.' }) {
  if (!rows?.length) {
    return <div className="empty-state">{emptyMessage}</div>;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => {
              const sortable = Boolean(col.sortKey);
              const active = sortBy === col.sortKey;
              return (
                <th key={col.key}>
                  {sortable ? (
                    <button
                      type="button"
                      className={`sort-btn ${active ? 'active' : ''}`}
                      onClick={() => onSort?.(col.sortKey)}
                    >
                      {col.label}
                      <span className="sort-indicator">
                        {active ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id ?? JSON.stringify(row)}>
              {columns.map((col) => (
                <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
