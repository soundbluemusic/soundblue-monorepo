import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
class MockResizeObserver implements ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn((): IntersectionObserverEntry[] => []);
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock requestAnimationFrame
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

// Mock requestIdleCallback
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

// Mock localStorage
const localStorageMock: Storage = {
  getItem: vi.fn((_key: string): string | null => null),
  setItem: vi.fn((_key: string, _value: string): void => {}),
  removeItem: vi.fn((_key: string): void => {}),
  clear: vi.fn((): void => {}),
  length: 0,
  key: vi.fn((_index: number): string | null => null),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});
