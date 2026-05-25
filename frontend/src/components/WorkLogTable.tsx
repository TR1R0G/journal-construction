import type { WorkLogEntry } from "../types/workLog";

type WorkLogTableProps = {
  entries: WorkLogEntry[];
  page: number;
  pageSize: number;
  total: number;
  onEdit: (entry: WorkLogEntry) => void;
  onDelete: (entry: WorkLogEntry) => void;
  onPageChange: (page: number) => void;
  loading?: boolean;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(value));

export function WorkLogTable({
  entries,
  page,
  pageSize,
  total,
  onEdit,
  onDelete,
  onPageChange,
  loading
}: WorkLogTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const firstItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, total);

  return (
    <section className="panel table-panel">
      <div className="section-heading">
        <div>
          <h2>Записи журнала</h2>
          <p className="muted">
            Всего записей: {total}
            {total > 0 ? `, показаны ${firstItem}-${lastItem}` : ""}
          </p>
        </div>
        {loading ? <span className="badge">Загрузка...</span> : null}
      </div>

      {entries.length === 0 && !loading ? (
        <div className="empty-state">Записей пока нет</div>
      ) : (
        <>
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

          <div className="pagination">
            <button
              type="button"
              className="secondary compact"
              onClick={() => onPageChange(page - 1)}
              disabled={loading || page <= 1}
            >
              Назад
            </button>
            <span>
              Страница {page} из {totalPages}
            </span>
            <button
              type="button"
              className="secondary compact"
              onClick={() => onPageChange(page + 1)}
              disabled={loading || page >= totalPages}
            >
              Вперёд
            </button>
          </div>
        </>
      )}
    </section>
  );
}
