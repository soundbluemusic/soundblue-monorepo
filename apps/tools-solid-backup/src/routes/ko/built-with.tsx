// Re-export the built-with page for Korean locale
// Locale is detected from URL path
export { default } from '../built-with';

// Pre-render Korean built-with page for static export
export function prerenderedPaths() {
  return ['/ko/built-with'];
}
