import { useEffect, useState } from "react";
import { apiClient } from "./api/client";
import { FilterPanel } from "./components/FilterPanel";
import { WorkLogForm } from "./components/WorkLogForm";
import { WorkLogTable } from "./components/WorkLogTable";
import type { WorkLogEntry, WorkLogEntryPayload, WorkLogFilters, WorkType } from "./types/workLog";

const defaultFilters: WorkLogFilters = {
  dateFrom: "",
  dateTo: "",
  sortOrder: "desc",
  page: 1,
  pageSize: 10
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Произошла неизвестная ошибка.";

export function App() {
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [entries, setEntries] = useState<WorkLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<WorkLogFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<WorkLogFilters>(defaultFilters);
  const [editingEntry, setEditingEntry] = useState<WorkLogEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEntries = async (nextFilters = appliedFilters) => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.getWorkLogEntries(nextFilters);
      setEntries(data.items);
      setTotal(data.total);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function loadInitialData() {
      setLoading(true);
      setError(null);

      try {
        const [workTypesData, entriesData] = await Promise.all([
          apiClient.getWorkTypes(),
          apiClient.getWorkLogEntries(defaultFilters)
        ]);

        if (!mounted) {
          return;
        }

        setWorkTypes(workTypesData);
        setEntries(entriesData.items);
        setTotal(entriesData.total);
      } catch (requestError) {
        if (mounted) {
          setError(getErrorMessage(requestError));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadInitialData();

    return () => {
      mounted = false;
    };
  }, []);

  const handleApplyFilters = () => {
    const nextFilters = { ...filters, page: 1 };
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
    void loadEntries(nextFilters);
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    void loadEntries(defaultFilters);
  };

  const handlePageChange = (page: number) => {
    const nextFilters = { ...appliedFilters, page };
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
    void loadEntries(nextFilters);
  };

  const handleSubmitEntry = async (payload: WorkLogEntryPayload) => {
    setSaving(true);
    setError(null);

    try {
      if (editingEntry) {
        await apiClient.updateWorkLogEntry(editingEntry.id, payload);
        setEditingEntry(null);
      } else {
        await apiClient.createWorkLogEntry(payload);
      }

      await loadEntries(appliedFilters);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async (entry: WorkLogEntry) => {
    const confirmed = window.confirm(
      `Удалить запись от ${new Intl.DateTimeFormat("ru-RU").format(new Date(entry.date))}?`
    );

    if (!confirmed) {
      return;
    }

    setError(null);

    try {
      await apiClient.deleteWorkLogEntry(entry.id);
      if (editingEntry?.id === entry.id) {
        setEditingEntry(null);
      }
      await loadEntries(appliedFilters);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  return (
    <main className="shell">
      <header className="hero">
        <p className="eyebrow">Строительный объект</p>
        <h1>Журнал работ</h1>
        <p>
          Ведите записи по видам работ, объёму и исполнителям. Данные сохраняются через API в
          PostgreSQL.
        </p>
      </header>

      {error ? <div className="alert">{error}</div> : null}

      <section className="layout">
        <div className="sidebar">
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
            disabled={loading || saving}
          />
          <WorkLogForm
            workTypes={workTypes}
            editingEntry={editingEntry}
            onSubmit={handleSubmitEntry}
            onCancelEdit={() => setEditingEntry(null)}
            disabled={saving}
          />
        </div>

        <WorkLogTable
          entries={entries}
          page={appliedFilters.page}
          pageSize={appliedFilters.pageSize}
          total={total}
          onEdit={setEditingEntry}
          onDelete={handleDeleteEntry}
          onPageChange={handlePageChange}
          loading={loading}
        />
      </section>
    </main>
  );
}
