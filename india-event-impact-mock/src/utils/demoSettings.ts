export interface DemoSettings {
  simSpeed: '1x' | '2x' | '5x' | 'instant';
  simulateRateLimit: boolean;
  simulateAllKeysExhausted: boolean;
  simulateSlowRun: boolean;
  simulateErrorAtStep: string | null;
}

export const DEFAULT_DEMO_SETTINGS: DemoSettings = {
  simSpeed: '1x',
  simulateRateLimit: false,
  simulateAllKeysExhausted: false,
  simulateSlowRun: false,
  simulateErrorAtStep: null,
};

const DEMO_SETTINGS_KEY = 'india_event_mock_demo_settings';

const memorySettingsStore: Record<string, string> = {};

function safeGet(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {
    // fallback
  }
  return memorySettingsStore[key] ?? null;
}

function safeSet(key: string, val: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, val);
      return;
    }
  } catch {
    // fallback
  }
  memorySettingsStore[key] = val;
}

function safeRemove(key: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
      return;
    }
  } catch {
    // fallback
  }
  delete memorySettingsStore[key];
}

export function getDemoSettings(): DemoSettings {
  try {
    const raw = safeGet(DEMO_SETTINGS_KEY);
    if (!raw) return DEFAULT_DEMO_SETTINGS;
    return { ...DEFAULT_DEMO_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_DEMO_SETTINGS;
  }
}

export function saveDemoSettings(settings: Partial<DemoSettings>): DemoSettings {
  const current = getDemoSettings();
  const updated = { ...current, ...settings };
  try {
    safeSet(DEMO_SETTINGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save demo settings', e);
  }
  return updated;
}

export function resetDemoSettings(): DemoSettings {
  try {
    safeRemove(DEMO_SETTINGS_KEY);
  } catch (e) {
    console.error('Failed to reset demo settings', e);
  }
  return DEFAULT_DEMO_SETTINGS;
}
