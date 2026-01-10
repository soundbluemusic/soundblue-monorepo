'use client';

import { Loader2 } from 'lucide-react';
import { lazy, Suspense } from 'react';

// Lazy load MainLayout to enable code splitting
const MainLayout = lazy(() => import('./MainLayout').then((m) => ({ default: m.MainLayout })));

// Loading fallback component
function LayoutLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-(--color-bg-primary)">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  );
}

/**
 * LazyMainLayout - Code-split wrapper for MainLayout
 *
 * This component enables lazy loading of MainLayout and all its dependencies
 * (ToolContainer, ToolSidebar, etc.) to improve initial page load performance.
 *
 * Usage:
 * ```tsx
 * // In route files
 * import { LazyMainLayout } from '~/components/layout';
 *
 * export default function ToolPage() {
 *   return <LazyMainLayout />;
 * }
 * ```
 */
export function LazyMainLayout() {
  return (
    <Suspense fallback={<LayoutLoading />}>
      <MainLayout />
    </Suspense>
  );
}
