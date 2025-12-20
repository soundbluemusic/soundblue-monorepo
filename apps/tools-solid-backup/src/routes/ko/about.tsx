// Re-export the about page for Korean locale
// Locale is detected from URL path
export { default } from '../about';

// Pre-render Korean about page for static export
export function prerenderedPaths() {
  return ['/ko/about'];
}
