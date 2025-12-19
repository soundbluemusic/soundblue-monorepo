/**
 * Shared Test Setup
 * 공용 테스트 설정 - 모든 앱에서 재사용
 *
 * Usage in app's vitest.config.ts:
 * setupFiles: ['@soundblue/shared/test/setup']
 */
import '@testing-library/jest-dom/vitest';
import { type Mock, vi } from 'vitest';

// ============================================
// Mock: window.matchMedia
// ============================================
export const mockMatchMedia: Mock<(query: string) => MediaQueryList> = vi
  .fn()
  .mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

// ============================================
// Mock: ResizeObserver
// ============================================
export class MockResizeObserver implements ResizeObserver {
  observe: Mock<(target: Element) => void> = vi.fn();
  unobserve: Mock<(target: Element) => void> = vi.fn();
  disconnect: Mock<() => void> = vi.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});

// ============================================
// Mock: IntersectionObserver
// ============================================
export class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  observe: Mock<(target: Element) => void> = vi.fn();
  unobserve: Mock<(target: Element) => void> = vi.fn();
  disconnect: Mock<() => void> = vi.fn();
  takeRecords: Mock<() => IntersectionObserverEntry[]> = vi.fn(() => []);
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// ============================================
// Mock: requestAnimationFrame / cancelAnimationFrame
// ============================================
Object.defineProperty(window, 'requestAnimationFrame', {
  writable: true,
  value: vi.fn().mockImplementation((callback: FrameRequestCallback) => {
    return setTimeout(() => callback(performance.now()), 0);
  }),
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  writable: true,
  value: vi.fn().mockImplementation((id: number) => {
    clearTimeout(id);
  }),
});

// ============================================
// Mock: requestIdleCallback / cancelIdleCallback
// ============================================
Object.defineProperty(window, 'requestIdleCallback', {
  writable: true,
  value: vi.fn().mockImplementation((callback: IdleRequestCallback) => {
    return setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 50 }), 0);
  }),
});

Object.defineProperty(window, 'cancelIdleCallback', {
  writable: true,
  value: vi.fn().mockImplementation((id: number) => {
    clearTimeout(id);
  }),
});

// ============================================
// Mock: localStorage
// ============================================
export const mockLocalStorage: Storage = {
  getItem: vi.fn((_key: string): string | null => null),
  setItem: vi.fn((_key: string, _value: string): void => {}),
  removeItem: vi.fn((_key: string): void => {}),
  clear: vi.fn((): void => {}),
  length: 0,
  key: vi.fn((_index: number): string | null => null),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// ============================================
// Mock: AudioContext (for tools app)
// ============================================

/** Mock GainNode return type */
interface MockGainNode {
  gain: { value: number; setValueAtTime: Mock };
  connect: Mock;
  disconnect: Mock;
}

/** Mock AnalyserNode return type */
interface MockAnalyserNode {
  fftSize: number;
  frequencyBinCount: number;
  getByteFrequencyData: Mock;
  getByteTimeDomainData: Mock;
  connect: Mock;
  disconnect: Mock;
}

/** Mock OscillatorNode return type */
interface MockOscillatorNode {
  type: string;
  frequency: { value: number };
  connect: Mock;
  disconnect: Mock;
  start: Mock;
  stop: Mock;
}

/** Mock AudioWorklet return type */
interface MockAudioWorklet {
  addModule: () => Promise<void>;
}

export class MockAudioContext {
  sampleRate = 48000;
  baseLatency = 0.01;
  outputLatency = 0.02;
  currentTime = 0;
  state = 'running' as AudioContextState;
  destination = {} as AudioDestinationNode;

  createGain(): MockGainNode {
    return {
      gain: { value: 1, setValueAtTime: vi.fn() },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
  }

  createAnalyser(): MockAnalyserNode {
    return {
      fftSize: 2048,
      frequencyBinCount: 1024,
      getByteFrequencyData: vi.fn(),
      getByteTimeDomainData: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
  }

  createOscillator(): MockOscillatorNode {
    return {
      type: 'sine',
      frequency: { value: 440 },
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }

  resume(): Promise<void> {
    return Promise.resolve();
  }

  close(): Promise<void> {
    return Promise.resolve();
  }

  get audioWorklet(): MockAudioWorklet {
    return {
      addModule: () => Promise.resolve(),
    };
  }
}

(globalThis as unknown as { AudioContext: typeof MockAudioContext }).AudioContext =
  MockAudioContext;

// ============================================
// Helper: Reset all mocks between tests
// ============================================
export function resetAllMocks() {
  vi.clearAllMocks();
  mockLocalStorage.getItem = vi.fn(() => null);
  mockLocalStorage.setItem = vi.fn();
  mockLocalStorage.removeItem = vi.fn();
  mockLocalStorage.clear = vi.fn();
}
