export interface OfflineVisitPayload {
  id: string;
  createdAt: string;
  payload: any;
  status: "pending" | "syncing" | "failed";
  lastError?: string;
}

const STORAGE_KEY = "dopamine-offline-visits";

function safeGetLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readAll(): OfflineVisitPayload[] {
  const storage = safeGetLocalStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as OfflineVisitPayload[];
  } catch {
    return [];
  }
}

function writeAll(items: OfflineVisitPayload[]): void {
  const storage = safeGetLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore quota / serialization errors
  }
}

export function getOfflineVisits(): OfflineVisitPayload[] {
  return readAll();
}

export function addOfflineVisit(p: OfflineVisitPayload): void {
  const items = readAll();
  items.push(p);
  writeAll(items);
}

export function updateOfflineVisit(
  id: string,
  partial: Partial<OfflineVisitPayload>
): void {
  const items = readAll();
  const next = items.map((item) =>
    item.id === id ? { ...item, ...partial } : item
  );
  writeAll(next);
}

export function clearOfflineVisit(id: string): void {
  const items = readAll();
  const next = items.filter((item) => item.id !== id);
  writeAll(next);
}

