import { useEffect, useState } from "react";
import { apiClient } from "./api/client";
import { FilterPanel } from "./components/FilterPanel";
import { WorkLogForm } from "./components/WorkLogForm";
import { WorkLogTable } from "./components/WorkLogTable";
import type { WorkLogEntry, WorkLogEntryPayload, WorkLogFilters, WorkType } from "./types/workLog";

const defaultFilters: WorkLogFilters = {
  dateFrom: "",
  dateTo: "",
  sortOrder: "desc"
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Произошла неизвестная ошибка.";

export function App() {
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [entries, setEntries] = useState<WorkLogEntry[]>([]);
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
      setEntries(data);
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
        setEntries(entriesData);
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
    setAppliedFilters(filters);
    void loadEntries(filters);
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    void loadEntries(defaultFilters);
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
    const confirmed = window.confirm(`Удалить запись от ${entry.date.slice(0, 10)}?`);

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
          onEdit={setEditingEntry}
          onDelete={handleDeleteEntry}
          loading={loading}
        />
      </section>
    </main>
  );
}
