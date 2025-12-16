// ========================================
// Browser API Type Declarations
// ========================================
// 표준 TypeScript lib에 없는 브라우저 API 타입

// Safari prefixed AudioContext
interface Window {
  webkitAudioContext?: typeof AudioContext;
}

// File System Access API
interface FilePickerOptions {
  suggestedName?: string;
  types?: Array<{
    description: string;
    accept: Record<string, string[]>;
  }>;
  excludeAcceptAllOption?: boolean;
  multiple?: boolean;
}

interface Window {
  showSaveFilePicker?: (options?: FilePickerOptions) => Promise<FileSystemFileHandle>;
  showOpenFilePicker?: (options?: FilePickerOptions) => Promise<FileSystemFileHandle[]>;
  showDirectoryPicker?: (options?: { mode?: 'read' | 'readwrite' }) => Promise<FileSystemDirectoryHandle>;
}

// Extend FileSystemFileHandle
interface FileSystemFileHandle {
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: string | ArrayBuffer | Blob): Promise<void>;
  close(): Promise<void>;
}
