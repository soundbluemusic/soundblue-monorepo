'use client';

import { Loader2 } from 'lucide-react';
import { lazy, Suspense } from 'react';

// Lazy load HomeLayout to enable code splitting
const HomeLayout = lazy(() => import('./HomeLayout').then((m) => ({ default: m.HomeLayout })));

// Loading fallback component
function LayoutLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-(--color-bg-primary)">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  );
}

/**
 * LazyHomeLayout - Code-split wrapper for HomeLayout
 *
 * This component enables lazy loading of HomeLayout and all its dependencies
 * (ToolSidebar, PopularToolsSection, etc.) to improve initial page load performance.
 */
export function LazyHomeLayout() {
  return (
    <Suspense fallback={<LayoutLoading />}>
      <HomeLayout />
    </Suspense>
  );
}
