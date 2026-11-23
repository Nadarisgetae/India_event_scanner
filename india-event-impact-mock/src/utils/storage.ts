import type { SavedReport } from '../types';
import defaultReportsHistory from '../data/reportsHistory.json';

const SAVED_REPORTS_KEY = 'india_event_mock_saved_reports';
const CONSIDERED_ACTIONS_KEY = 'india_event_mock_considered_actions';

// In-memory fallback for environments without localStorage (e.g. Node CLI testing)
const memoryStorage: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {
    // fallback
  }
  return memoryStorage[key] ?? null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      return;
    }
  } catch {
    // fallback
  }
  memoryStorage[key] = value;
}

export function getStoredReports(): SavedReport[] {
  try {
    const raw = safeGetItem(SAVED_REPORTS_KEY);
    if (!raw) {
      safeSetItem(SAVED_REPORTS_KEY, JSON.stringify(defaultReportsHistory));
      return defaultReportsHistory as SavedReport[];
    }
    return JSON.parse(raw) as SavedReport[];
  } catch {
    return defaultReportsHistory as SavedReport[];
  }
}

export function saveStoredReport(report: SavedReport): SavedReport[] {
  const current = getStoredReports();
  const existingIndex = current.findIndex(r => r.id === report.id);
  let updated: SavedReport[];
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = report;
  } else {
    updated = [report, ...current];
  }
  try {
    safeSetItem(SAVED_REPORTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save report to storage', e);
  }
  return updated;
}

export function deleteStoredReport(id: string): SavedReport[] {
  const current = getStoredReports();
  const updated = current.filter(r => r.id !== id);
  try {
    safeSetItem(SAVED_REPORTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete report from storage', e);
  }
  return updated;
}

export function getConsideredActions(reportId: string): Record<string, boolean> {
  try {
    const raw = safeGetItem(`${CONSIDERED_ACTIONS_KEY}_${reportId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function toggleConsideredAction(reportId: string, actionKey: string): Record<string, boolean> {
  const current = getConsideredActions(reportId);
  const updated = { ...current, [actionKey]: !current[actionKey] };
  try {
    safeSetItem(`${CONSIDERED_ACTIONS_KEY}_${reportId}`, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to persist considered action', e);
  }
  return updated;
}
