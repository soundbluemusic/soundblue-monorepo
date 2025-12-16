// ========================================
// Storage Layer - FileSystem API + IndexedDB
// ========================================
// 프로젝트 파일 저장/로드 + 자동 백업

import Dexie, { type EntityTable } from 'dexie';

// ========================================
// IndexedDB (Dexie) - 자동 백업용
// ========================================

/**
 * Serializable value type for project data.
 * Using recursive type instead of loose `object` for better type safety.
 */
export type ProjectDataValue =
  | string
  | number
  | boolean
  | null
  | ProjectDataValue[]
  | { [key: string]: ProjectDataValue };

/**
 * Base interface for project data stored in IndexedDB.
 * Projects can have tool-specific settings and custom data.
 */
export interface ProjectData {
  /** Project display name */
  name?: string;
  /** Version number for data migration */
  version?: number;
  /** Creation timestamp */
  createdAt?: number;
  /** Last modified timestamp */
  updatedAt?: number;
  /** Tool-specific settings stored as serializable values */
  settings?: Record<string, ProjectDataValue>;
  /** Additional project-specific data */
  data?: Record<string, ProjectDataValue>;
}

interface ProjectBackup {
  id: string;
  name: string;
  data: string; // JSON serialized
  createdAt: number;
  updatedAt: number;
}

interface AudioFile {
  id: string;
  projectId: string;
  name: string;
  data: ArrayBuffer;
  mimeType: string;
  duration: number;
  sampleRate: number;
  channels: number;
  createdAt: number;
}

interface UserPreference {
  key: string;
  value: string;
}

class ToolsDatabase extends Dexie {
  projects!: EntityTable<ProjectBackup, 'id'>;
  audioFiles!: EntityTable<AudioFile, 'id'>;
  preferences!: EntityTable<UserPreference, 'key'>;

  constructor() {
    super('tools-db');

    this.version(1).stores({
      projects: 'id, name, updatedAt',
      audioFiles: 'id, projectId, name',
      preferences: 'key',
    });
  }
}

// Lazy initialization for SSR compatibility
let dbInstance: ToolsDatabase | null = null;

function getDb(): ToolsDatabase {
  if (typeof window === 'undefined') {
    throw new Error('Database is not available during SSR');
  }
  if (!dbInstance) {
    dbInstance = new ToolsDatabase();
  }
  return dbInstance;
}

// ========================================
// IndexedDB Operations
// ========================================

export async function saveProjectBackup(
  id: string,
  name: string,
  data: ProjectData
): Promise<void> {
  await getDb().projects.put({
    id,
    name,
    data: JSON.stringify(data),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
}

export async function loadProjectBackup(id: string): Promise<ProjectData | null> {
  const backup = await getDb().projects.get(id);
  if (backup) {
    return JSON.parse(backup.data) as ProjectData;
  }
  return null;
}

export async function getProjectList(): Promise<
  Array<{ id: string; name: string; updatedAt: number }>
> {
  return getDb().projects.orderBy('updatedAt').reverse().toArray();
}

export async function deleteProjectBackup(id: string): Promise<void> {
  const db = getDb();
  await db.projects.delete(id);
  // Also delete associated audio files
  await db.audioFiles.where('projectId').equals(id).delete();
}

export async function saveAudioFile(file: AudioFile): Promise<void> {
  await getDb().audioFiles.put(file);
}

export async function loadAudioFile(id: string): Promise<AudioFile | undefined> {
  return getDb().audioFiles.get(id);
}

export async function getPreference(key: string): Promise<string | null> {
  const pref = await getDb().preferences.get(key);
  return pref?.value ?? null;
}

export async function setPreference(key: string, value: string): Promise<void> {
  await getDb().preferences.put({ key, value });
}

// ========================================
// FileSystem Access API - 로컬 파일 저장
// ========================================

interface FileSystemOptions {
  suggestedName?: string;
  types?: Array<{
    description: string;
    accept: Record<string, string[]>;
  }>;
}

// Check if File System Access API is available
export function isFileSystemSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'showSaveFilePicker' in window && 'showOpenFilePicker' in window;
}

// Save project to local file
export async function saveToFile(
  data: ProjectData,
  options: FileSystemOptions = {}
): Promise<FileSystemFileHandle | null> {
  if (!isFileSystemSupported()) {
    // Fallback: download as file
    downloadAsFile(data, options.suggestedName || 'project.sbm');
    return null;
  }

  try {
    const handle = await window.showSaveFilePicker!({
      suggestedName: options.suggestedName || 'project.sbm',
      types: options.types || [
        {
          description: 'Sound Blue Music Project',
          accept: { 'application/json': ['.sbm'] },
        },
      ],
    });

    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();

    return handle;
  } catch {
    return null;
  }
}

// Load project from local file
export async function loadFromFile<T = ProjectData>(
  options: FileSystemOptions = {}
): Promise<{ data: T; handle: FileSystemFileHandle | null } | null> {
  if (!isFileSystemSupported()) {
    // Fallback: use file input
    return loadFromFileInput<T>();
  }

  try {
    const handles = await window.showOpenFilePicker!({
      types: options.types || [
        {
          description: 'Sound Blue Music Project',
          accept: { 'application/json': ['.sbm'] },
        },
      ],
    });

    const handle = handles[0];
    if (!handle) return null;

    const file = await handle.getFile();
    const text = await file.text();
    const data = JSON.parse(text) as T;

    return { data, handle };
  } catch {
    return null;
  }
}

// Fallback: download as file
function downloadAsFile(data: ProjectData, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Fallback: load from file input
function loadFromFileInput<T>(): Promise<{ data: T; handle: null } | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.sbm,.json';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      try {
        const text = await file.text();
        const data = JSON.parse(text) as T;
        resolve({ data, handle: null });
      } catch {
        resolve(null);
      }
    };

    input.oncancel = () => resolve(null);
    input.click();
  });
}

// ========================================
// Auto-save Manager
// ========================================

class AutoSaveManager {
  private intervalId?: ReturnType<typeof setInterval>;
  private projectId?: string;
  private getData?: () => ProjectData;
  private interval = 60000; // 1 minute default

  start(projectId: string, getData: () => ProjectData, intervalMs = 60000): void {
    this.stop();

    this.projectId = projectId;
    this.getData = getData;
    this.interval = intervalMs;

    this.intervalId = setInterval(() => {
      this.save();
    }, this.interval);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  async save(): Promise<void> {
    if (!this.projectId || !this.getData) return;

    try {
      const data = this.getData();
      await saveProjectBackup(this.projectId, data.name || 'Untitled', data);
    } catch {
      // Auto-save failed silently
    }
  }

  // Force save immediately
  async saveNow(): Promise<void> {
    await this.save();
  }
}

export const autoSaveManager = new AutoSaveManager();

// ========================================
// SolidJS Hooks
// ========================================

import { type Accessor, createEffect, createSignal, onCleanup } from 'solid-js';

export function useProjectStorage(projectId: string): {
  save: (data: ProjectData) => Promise<void>;
  load: () => Promise<ProjectData | null>;
  isSaving: Accessor<boolean>;
  lastSaved: Accessor<Date | null>;
  saveToFile: typeof saveToFile;
  loadFromFile: typeof loadFromFile;
  isFileSystemSupported: boolean;
} {
  const [isSaving, setIsSaving] = createSignal(false);
  const [lastSaved, setLastSaved] = createSignal<Date | null>(null);

  const save = async (data: ProjectData): Promise<void> => {
    setIsSaving(true);
    try {
      await saveProjectBackup(projectId, data.name || 'Untitled', data);
      setLastSaved(new Date());
    } finally {
      setIsSaving(false);
    }
  };

  const load = async () => {
    return loadProjectBackup(projectId);
  };

  return {
    save,
    load,
    isSaving,
    lastSaved,
    saveToFile,
    loadFromFile,
    isFileSystemSupported: isFileSystemSupported(),
  };
}

export function useAutoSave(
  projectId: Accessor<string>,
  getData: () => ProjectData,
  enabled: Accessor<boolean> = () => true,
  intervalMs = 60000
): {
  saveNow: () => Promise<void>;
} {
  createEffect(() => {
    if (enabled() && projectId()) {
      autoSaveManager.start(projectId(), getData, intervalMs);
      onCleanup(() => autoSaveManager.stop());
    }
  });

  return {
    saveNow: () => autoSaveManager.saveNow(),
  };
}
