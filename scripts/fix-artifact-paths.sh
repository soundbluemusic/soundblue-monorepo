#!/bin/bash
# Fix artifact paths after download
# GitHub Actions artifact structure: apps/{app}/{app}/dist → apps/{app}/dist

echo "=== Artifact debug: listing apps/ structure ==="
for app in sound-blue tools dialogue; do
  echo "--- apps/$app ---"
  ls -la "apps/$app/" 2>/dev/null || echo "  apps/$app/ does not exist"
  if [ -d "apps/$app/dist" ]; then
    echo "  dist/ already exists at apps/$app/dist"
    ls "apps/$app/dist/" 2>/dev/null
  elif [ -d "apps/$app/$app/dist" ]; then
    mv "apps/$app/$app/dist" "apps/$app/dist"
    rmdir "apps/$app/$app" 2>/dev/null || true
    echo "  Fixed: apps/$app/dist (moved from apps/$app/$app/dist)"
  elif [ -d "apps/$app/$app" ]; then
    echo "  Found apps/$app/$app but no dist inside:"
    ls -la "apps/$app/$app/" 2>/dev/null
  else
    echo "  WARNING: No dist found for $app"
    echo "  Checking if dist exists elsewhere:"
    find "apps/$app" -name "dist" -type d 2>/dev/null || echo "  No dist directory found"
  fi
done
echo "=== End artifact debug ==="
