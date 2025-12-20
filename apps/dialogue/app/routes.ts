import { index, type RouteConfig, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('about', 'routes/about.tsx'),
  route('ko', 'routes/ko/home.tsx'),
  route('ko/about', 'routes/ko/about.tsx'),
] satisfies RouteConfig;
