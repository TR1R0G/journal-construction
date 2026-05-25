export type SortOrder = "asc" | "desc";

export type WorkType = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkLogEntry = {
  id: number;
  date: string;
  workTypeId: number;
  workType: WorkType;
  volumeValue: string;
  volumeUnit: string;
  performerName: string;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WorkLogEntryPayload = {
  date: string;
  workTypeId: number;
  volumeValue: number;
  volumeUnit: string;
  performerName: string;
  comment?: string | null;
};

export type WorkLogFilters = {
  dateFrom: string;
  dateTo: string;
  sortOrder: SortOrder;
};
