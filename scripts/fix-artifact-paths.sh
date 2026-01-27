#!/bin/bash
# Fix artifact paths after download
# GitHub Actions artifact structure: apps/{app}/{app}/dist → apps/{app}/dist

for app in sound-blue tools dialogue; do
  if [ -d "apps/$app/$app/dist" ]; then
    mv "apps/$app/$app/dist" "apps/$app/dist"
    rmdir "apps/$app/$app" 2>/dev/null || true
    echo "Fixed: apps/$app/dist"
  fi
done
