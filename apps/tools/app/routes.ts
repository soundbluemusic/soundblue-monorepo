import { type RouteConfig, route } from '@react-router/dev/routes';

export default [
  // English routes
  route('/', 'routes/home.tsx'),
  route('about', 'routes/about.tsx'),
  route('built-with', 'routes/built-with.tsx'),
  route('benchmark', 'routes/benchmark.tsx'),
  route('metronome', 'routes/metronome.tsx'),
  route('drumMachine', 'routes/drum-machine.tsx'),
  route('qr', 'routes/qr.tsx'),
  route('translator', 'routes/translator.tsx'),

  // Korean routes
  route('ko', 'routes/ko/home.tsx'),
  route('ko/about', 'routes/ko/about.tsx'),
  route('ko/built-with', 'routes/ko/built-with.tsx'),
  route('ko/benchmark', 'routes/ko/benchmark.tsx'),
  route('ko/metronome', 'routes/ko/metronome.tsx'),
  route('ko/drumMachine', 'routes/ko/drum-machine.tsx'),
  route('ko/qr', 'routes/ko/qr.tsx'),
  route('ko/translator', 'routes/ko/translator.tsx'),
] satisfies RouteConfig;
