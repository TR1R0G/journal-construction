import type {
  PaginatedResponse,
  WorkLogEntry,
  WorkLogEntryPayload,
  WorkLogFilters,
  WorkType
} from "../types/workLog";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

type ApiErrorResponse = {
  message?: string;
  errors?: {
    formErrors?: string[];
    fieldErrors?: Record<string, string[]>;
  };
};

const formatApiError = (payload: ApiErrorResponse | null, status: number) => {
  if (!payload) {
    return `Ошибка API: ${status}`;
  }

  const fieldErrors = payload.errors?.fieldErrors
    ? Object.values(payload.errors.fieldErrors).flat().filter(Boolean)
    : [];
  const formErrors = payload.errors?.formErrors?.filter(Boolean) ?? [];
  const details = [...formErrors, ...fieldErrors];

  if (details.length > 0) {
    return `${payload.message ?? "Ошибка валидации"}: ${details.join("; ")}`;
  }

  return payload.message ?? `Ошибка API: ${status}`;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers
    },
    ...options
  });

  if (!response.ok) {
    let payload: ApiErrorResponse | null = null;

    try {
      payload = (await response.json()) as ApiErrorResponse;
    } catch {
      payload = null;
    }

    throw new Error(formatApiError(payload, response.status));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const apiClient = {
  getWorkTypes: () => request<WorkType[]>("/api/work-types"),

  getWorkLogEntries: (filters: WorkLogFilters) => {
    const params = new URLSearchParams();

    if (filters.dateFrom) {
      params.set("dateFrom", filters.dateFrom);
    }

    if (filters.dateTo) {
      params.set("dateTo", filters.dateTo);
    }

    params.set("sortOrder", filters.sortOrder);
    params.set("page", String(filters.page));
    params.set("pageSize", String(filters.pageSize));

    return request<PaginatedResponse<WorkLogEntry>>(`/api/work-log-entries?${params.toString()}`);
  },

  createWorkLogEntry: (payload: WorkLogEntryPayload) =>
    request<WorkLogEntry>("/api/work-log-entries", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  updateWorkLogEntry: (id: number, payload: WorkLogEntryPayload) =>
    request<WorkLogEntry>(`/api/work-log-entries/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),

  deleteWorkLogEntry: (id: number) =>
    request<void>(`/api/work-log-entries/${id}`, {
      method: "DELETE"
    })
};
