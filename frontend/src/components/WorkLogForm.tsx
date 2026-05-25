import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type { WorkLogEntry, WorkLogEntryPayload, WorkType } from "../types/workLog";

type FormState = {
  date: string;
  workTypeId: string;
  volumeValue: string;
  volumeUnit: string;
  performerName: string;
  comment: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

type WorkLogFormProps = {
  workTypes: WorkType[];
  editingEntry: WorkLogEntry | null;
  onSubmit: (payload: WorkLogEntryPayload) => Promise<void>;
  onCancelEdit: () => void;
  disabled?: boolean;
};

const volumeUnits = ["м³", "м²", "шт", "п.м.", "т"];

const initialState: FormState = {
  date: "",
  workTypeId: "",
  volumeValue: "",
  volumeUnit: "м³",
  performerName: "",
  comment: ""
};

const toDateInputValue = (value: string) => value.slice(0, 10);

export function WorkLogForm({
  workTypes,
  editingEntry,
  onSubmit,
  onCancelEdit,
  disabled
}: WorkLogFormProps) {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!editingEntry) {
      setForm(initialState);
      setErrors({});
      return;
    }

    setForm({
      date: toDateInputValue(editingEntry.date),
      workTypeId: String(editingEntry.workTypeId),
      volumeValue: String(editingEntry.volumeValue),
      volumeUnit: editingEntry.volumeUnit,
      performerName: editingEntry.performerName,
      comment: editingEntry.comment ?? ""
    });
    setErrors({});
  }, [editingEntry]);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    const volume = Number(form.volumeValue);

    if (!form.date) {
      nextErrors.date = "Укажите дату выполнения.";
    }

    if (!form.workTypeId) {
      nextErrors.workTypeId = "Выберите вид работ.";
    }

    if (!form.volumeValue || Number.isNaN(volume) || volume <= 0) {
      nextErrors.volumeValue = "Укажите объём больше 0.";
    }

    if (!form.volumeUnit.trim()) {
      nextErrors.volumeUnit = "Укажите единицу измерения.";
    }

    if (!form.performerName.trim()) {
      nextErrors.performerName = "Укажите ФИО исполнителя.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit({
      date: form.date,
      workTypeId: Number(form.workTypeId),
      volumeValue: Number(form.volumeValue),
      volumeUnit: form.volumeUnit.trim(),
      performerName: form.performerName.trim(),
      comment: form.comment.trim() || null
    });

    if (!editingEntry) {
      setForm(initialState);
      setErrors({});
    }
  };

  return (
    <form className="panel entry-form" onSubmit={handleSubmit}>
      <div className="section-heading">
        <div>
          <h2>{editingEntry ? "Редактирование записи" : "Новая запись"}</h2>
          <p className="muted">Заполните обязательные поля перед сохранением.</p>
        </div>
      </div>

      <div className="form-grid">
        <label>
          Дата
          <input
            type="date"
            value={form.date}
            onChange={(event) => updateField("date", event.target.value)}
            disabled={disabled}
          />
          {errors.date ? <span className="field-error">{errors.date}</span> : null}
        </label>

        <label>
          Вид работ
          <select
            value={form.workTypeId}
            onChange={(event) => updateField("workTypeId", event.target.value)}
            disabled={disabled || workTypes.length === 0}
          >
            <option value="">Выберите вид работ</option>
            {workTypes.map((workType) => (
              <option key={workType.id} value={workType.id}>
                {workType.name}
              </option>
            ))}
          </select>
          {errors.workTypeId ? <span className="field-error">{errors.workTypeId}</span> : null}
        </label>

        <label>
          Объём
          <input
            type="number"
            min="0"
            step="0.001"
            value={form.volumeValue}
            onChange={(event) => updateField("volumeValue", event.target.value)}
            disabled={disabled}
            placeholder="Например, 12.5"
          />
          {errors.volumeValue ? <span className="field-error">{errors.volumeValue}</span> : null}
        </label>

        <label>
          Единица измерения
          <select
            value={form.volumeUnit}
            onChange={(event) => updateField("volumeUnit", event.target.value)}
            disabled={disabled}
          >
            {volumeUnits.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
          {errors.volumeUnit ? <span className="field-error">{errors.volumeUnit}</span> : null}
        </label>

        <label className="wide">
          ФИО исполнителя
          <input
            type="text"
            value={form.performerName}
            onChange={(event) => updateField("performerName", event.target.value)}
            disabled={disabled}
            placeholder="Иванов Иван Иванович"
          />
          {errors.performerName ? <span className="field-error">{errors.performerName}</span> : null}
        </label>

        <label className="wide">
          Комментарий
          <textarea
            value={form.comment}
            onChange={(event) => updateField("comment", event.target.value)}
            disabled={disabled}
            rows={4}
            placeholder="Необязательный комментарий"
          />
        </label>
      </div>

      <div className="actions">
        <button type="submit" disabled={disabled}>
          {editingEntry ? "Сохранить" : "Создать"}
        </button>
        {editingEntry ? (
          <button type="button" className="secondary" onClick={onCancelEdit} disabled={disabled}>
            Отмена
          </button>
        ) : null}
      </div>
    </form>
  );
}
