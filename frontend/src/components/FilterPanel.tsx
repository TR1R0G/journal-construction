import type { FormEvent } from "react";
import type { SortOrder, WorkLogFilters } from "../types/workLog";

type FilterPanelProps = {
  filters: WorkLogFilters;
  onChange: (filters: WorkLogFilters) => void;
  onApply: () => void;
  onReset: () => void;
  disabled?: boolean;
};

export function FilterPanel({ filters, onChange, onApply, onReset, disabled }: FilterPanelProps) {
  const updateFilter = (field: keyof WorkLogFilters, value: string) => {
    onChange({
      ...filters,
      [field]: field === "sortOrder" ? (value as SortOrder) : value
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onApply();
  };

  return (
    <form className="panel filter-panel" onSubmit={handleSubmit}>
      <div>
        <h2>Фильтр</h2>
        <p className="muted">Отберите записи по периоду выполнения и порядку сортировки.</p>
      </div>

      <label>
        Дата с
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(event) => updateFilter("dateFrom", event.target.value)}
          disabled={disabled}
        />
      </label>

      <label>
        Дата по
        <input
          type="date"
          value={filters.dateTo}
          onChange={(event) => updateFilter("dateTo", event.target.value)}
          disabled={disabled}
        />
      </label>

      <label>
        Сортировка
        <select
          value={filters.sortOrder}
          onChange={(event) => updateFilter("sortOrder", event.target.value)}
          disabled={disabled}
        >
          <option value="desc">Сначала новые</option>
          <option value="asc">Сначала старые</option>
        </select>
      </label>

      <label>
        На странице
        <select
          value={filters.pageSize}
          onChange={(event) =>
            onChange({
              ...filters,
              page: 1,
              pageSize: Number(event.target.value)
            })
          }
          disabled={disabled}
        >
          <option value={5}>5 записей</option>
          <option value={10}>10 записей</option>
          <option value={20}>20 записей</option>
          <option value={50}>50 записей</option>
        </select>
      </label>

      <div className="actions">
        <button type="submit" disabled={disabled}>
          Применить
        </button>
        <button type="button" className="secondary" onClick={onReset} disabled={disabled}>
          Сбросить
        </button>
      </div>
    </form>
  );
}
