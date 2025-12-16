import '@testing-library/jest-dom';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  root = null;
  rootMargin = '';
  thresholds = [];
  takeRecords() {
    return [];
  }
};

// Mock AudioContext
class MockAudioContext {
  sampleRate = 48000;
  baseLatency = 0.01;
  outputLatency = 0.02;
  currentTime = 0;
  state = 'running';
  destination = {};

  createGain() {
    return {
      gain: { value: 1, setValueAtTime: () => {} },
      connect: () => {},
      disconnect: () => {},
    };
  }

  createAnalyser() {
    return {
      fftSize: 2048,
      frequencyBinCount: 1024,
      getByteFrequencyData: () => {},
      getByteTimeDomainData: () => {},
      connect: () => {},
      disconnect: () => {},
    };
  }

  createOscillator() {
    return {
      type: 'sine',
      frequency: { value: 440 },
      connect: () => {},
      disconnect: () => {},
      start: () => {},
      stop: () => {},
    };
  }

  resume() {
    return Promise.resolve();
  }

  close() {
    return Promise.resolve();
  }

  get audioWorklet() {
    return {
      addModule: () => Promise.resolve(),
    };
  }
}

(global as unknown as { AudioContext: typeof MockAudioContext }).AudioContext = MockAudioContext;

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback) => {
  return setTimeout(() => callback(Date.now()), 16) as unknown as number;
};

global.cancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};
