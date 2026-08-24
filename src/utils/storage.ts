import type { UserProgress } from '../types/system';

const STORAGE_KEY = 'ascend_user_progress';

export function saveUserProgress(progress: UserProgress): void {
  try {
    const serialized = JSON.stringify(progress);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (err) {
    console.error('Failed to save ASCEND user progress to localStorage:', err);
  }
}

export function loadUserProgress(): UserProgress | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;
    return JSON.parse(serialized) as UserProgress;
  } catch (err) {
    console.error('Failed to load ASCEND user progress from localStorage:', err);
    return null;
  }
}

export function clearUserProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear ASCEND user progress:', err);
  }
}

export function exportProgressJSON(progress: UserProgress): string {
  return JSON.stringify(progress, null, 2);
}

export function downloadProgressFile(progress: UserProgress): void {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportProgressJSON(progress));
  const downloadAnchor = document.createElement('a');
  const filename = `ASCEND_SAVE_${progress.profile.name.replace(/\s+/g, '_')}_LVL${progress.level}.json`;
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importProgressFromJSON(jsonText: string): UserProgress | null {
  try {
    const parsed = JSON.parse(jsonText) as UserProgress;
    if (parsed && parsed.profile && parsed.stats && typeof parsed.level === 'number') {
      saveUserProgress(parsed);
      return parsed;
    }
    return null;
  } catch (err) {
    console.error('Invalid ASCEND JSON save file:', err);
    return null;
  }
}
