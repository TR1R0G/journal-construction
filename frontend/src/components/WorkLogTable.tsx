import type { WorkLogEntry } from "../types/workLog";

type WorkLogTableProps = {
  entries: WorkLogEntry[];
  onEdit: (entry: WorkLogEntry) => void;
  onDelete: (entry: WorkLogEntry) => void;
  loading?: boolean;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));

export function WorkLogTable({ entries, onEdit, onDelete, loading }: WorkLogTableProps) {
  return (
    <section className="panel table-panel">
      <div className="section-heading">
        <div>
          <h2>Записи журнала</h2>
          <p className="muted">Всего записей: {entries.length}</p>
        </div>
        {loading ? <span className="badge">Загрузка...</span> : null}
      </div>

      {entries.length === 0 && !loading ? (
        <div className="empty-state">Записей пока нет или они не попадают под выбранный фильтр.</div>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Вид работ</th>
                <th>Объём</th>
                <th>Исполнитель</th>
                <th>Комментарий</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{formatDate(entry.date)}</td>
                  <td>{entry.workType.name}</td>
                  <td>
                    {entry.volumeValue} {entry.volumeUnit}
                  </td>
                  <td>{entry.performerName}</td>
                  <td>{entry.comment || "—"}</td>
                  <td>
                    <div className="row-actions">
                      <button type="button" className="compact" onClick={() => onEdit(entry)}>
                        Редактировать
                      </button>
                      <button type="button" className="compact danger" onClick={() => onDelete(entry)}>
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
