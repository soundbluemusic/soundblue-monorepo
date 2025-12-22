#!/bin/bash

# Fix meta test type errors across all route test files

cd /home/user/soundblue-monorepo/apps/sound-blue

# Find all route test files
for file in app/routes/*.test.tsx; do
  # Skip if file doesn't exist
  [ -f "$file" ] || continue

  echo "Processing $file..."

  # Fix metaResult type assertions
  sed -i 's/const metaResult = meta({} as any);/const metaResult = meta({} as any) as any[];/g' "$file"

  # Fix titleMeta and descMeta type assertions
  sed -i 's/const titleMeta = metaResult\.find((m: any) => m\.title);/const titleMeta = metaResult?.find((m: any) => m\.title) as any;/g' "$file"
  sed -i 's/const descMeta = metaResult\.find((m: any) => m\.name === '\''description'\'');/const descMeta = metaResult?.find((m: any) => m\.name === '\''description'\'') as any;/g' "$file"

  # Fix property access
  sed -i 's/expect(titleMeta\?\./expect(titleMeta\./g' "$file"
  sed -i 's/expect(descMeta\?\./expect(descMeta\./g' "$file"
done

echo "Done!"
