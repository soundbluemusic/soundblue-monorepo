#!/usr/bin/env node
/**
 * Automated migration script: Custom i18n → Paraglide JS
 *
 * This script automatically converts all files from the old custom i18n
 * implementation to Paraglide JS by:
 * 1. Replacing imports
 * 2. Replacing hook usage
 * 3. Converting translation access patterns
 *
 * Usage: node scripts/migrate-to-paraglide.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const FILES_TO_MIGRATE = {
  'sound-blue': [
    'app/components/layout/NavigationLayout.tsx',
    'app/components/navigation/BottomNav.tsx',
    'app/components/navigation/Sidebar.tsx',
    'app/components/ui/SearchBox.tsx',
    'app/components/home/HomeContent.tsx',
    'app/components/layout/Footer.tsx',
    'app/routes/about.tsx',
    'app/routes/chat.tsx',
    'app/routes/ko/about.tsx',
    'app/routes/ko/blog.tsx',
    'app/routes/ko/built-with.tsx',
    'app/routes/ko/chat.tsx',
    'app/routes/ko/home.tsx',
    'app/routes/ko/license.tsx',
    'app/routes/ko/news.tsx',
    'app/routes/ko/privacy.tsx',
    'app/routes/ko/sitemap.tsx',
    'app/routes/ko/sound-recording.tsx',
    'app/routes/ko/terms.tsx',
    'app/routes/offline.tsx',
    'app/routes/blog.tsx',
    'app/routes/built-with.tsx',
    'app/routes/home.tsx',
    'app/routes/license.tsx',
    'app/routes/news.tsx',
    'app/routes/privacy.tsx',
    'app/routes/sitemap.tsx',
    'app/routes/sound-recording.tsx',
    'app/routes/terms.tsx',
  ],
  tools: [
    'app/components/layout/Header.tsx',
    'app/components/layout/HomeLayout.tsx',
    'app/components/sidebar/ToolCategory.tsx',
    'app/components/sidebar/ToolItem.tsx',
    'app/components/sidebar/ToolSidebar.tsx',
    'app/components/tools/ToolContainer.tsx',
    'app/components/widgets/WorldClockWidget.tsx',
    'app/routes/about.tsx',
    'app/routes/benchmark.tsx',
    'app/routes/built-with.tsx',
    'app/routes/ko/about.tsx',
    'app/routes/ko/benchmark.tsx',
    'app/routes/ko/built-with.tsx',
    'app/tools/drum-machine/index.tsx',
    'app/tools/metronome/index.tsx',
    'app/tools/qr-generator/index.tsx',
    'app/tools/translator/index.tsx',
  ],
};

/**
 * Convert dot notation to bracket notation for Paraglide
 * Examples:
 *   t.nav.home → m['nav.home']()
 *   t.header.sidebarOpen → m['header.sidebarOpen']()
 */
function convertTranslationAccess(content) {
  // Match patterns like t.word.word or t.word.word.word etc.
  return content.replace(
    /\bt\.([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)+)/g,
    (_match, path) => {
      return `m['${path}']()`;
    },
  );
}

/**
 * Migrate a single file
 */
function migrateFile(filePath, app) {
  const fullPath = resolve(`apps/${app}`, filePath);
  console.log(`📝 Migrating: ${filePath}`);

  try {
    let content = readFileSync(fullPath, 'utf-8');
    let modified = false;

    // Step 1: Replace import
    if (content.includes("from '~/i18n'")) {
      // Remove old import
      content = content.replace(/import\s+\{[^}]*\}\s+from\s+['"]~\/i18n['"];?\s*/g, '');

      // Add Paraglide imports
      const importBlock = `import * as m from '~/paraglide/messages';\n`;

      // Check if we need useParaglideI18n
      const needsHook =
        content.includes('toggleLanguage') ||
        content.includes('localizedPath') ||
        content.includes('locale');

      // Find the right place to insert imports (after other imports)
      const lines = content.split('\n');
      let lastImportIndex = -1;

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ')) {
          lastImportIndex = i;
        }
      }

      if (lastImportIndex >= 0) {
        // Check if @soundblue/shared-react import exists
        const sharedReactImportIndex = lines.findIndex((line) =>
          line.includes("from '@soundblue/shared-react'"),
        );

        if (needsHook) {
          if (sharedReactImportIndex >= 0) {
            // Update existing import to include useParaglideI18n
            const line = lines[sharedReactImportIndex];
            if (!line.includes('useParaglideI18n')) {
              lines[sharedReactImportIndex] = line.replace(
                /import\s+\{([^}]*)\}/,
                (_match, imports) => {
                  const importList = imports
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean);
                  if (!importList.includes('useParaglideI18n')) {
                    importList.push('useParaglideI18n');
                  }
                  return `import { ${importList.join(', ')} }`;
                },
              );
            }
          } else {
            // Add new import for useParaglideI18n
            lines.splice(
              lastImportIndex + 1,
              0,
              "import { useParaglideI18n } from '@soundblue/shared-react';",
            );
            lastImportIndex++;
          }
        }

        // Add Paraglide message import
        lines.splice(lastImportIndex + 1, 0, importBlock.trim());
        content = lines.join('\n');
      } else {
        // No imports found, add at the top
        content =
          importBlock +
          (needsHook ? "import { useParaglideI18n } from '@soundblue/shared-react';\n" : '') +
          content;
      }

      modified = true;
    }

    // Step 2: Replace hook usage
    if (content.includes('useI18n()')) {
      content = content.replace(
        /const\s+\{\s*([^}]+)\s*\}\s*=\s*useI18n\(\);?/g,
        (_match, destructured) => {
          const vars = destructured
            .split(',')
            .map((v) => v.trim())
            .filter((v) => v !== 't');

          if (vars.length > 0) {
            return `const { ${vars.join(', ')} } = useParaglideI18n();`;
          }
          return ''; // Remove if only 't' was used
        },
      );
      modified = true;
    }

    // Step 3: Convert translation access patterns
    const newContent = convertTranslationAccess(content);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }

    // Step 4: Clean up empty lines
    content = content.replace(/\n\n\n+/g, '\n\n');

    if (modified) {
      writeFileSync(fullPath, content, 'utf-8');
      console.log(`✅ Migrated: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️  Skipped (no changes): ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error migrating ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main migration function
 */
function main() {
  console.log('🚀 Starting Paraglide JS migration...\n');

  let totalMigrated = 0;
  let totalFailed = 0;

  for (const [app, files] of Object.entries(FILES_TO_MIGRATE)) {
    console.log(`\n📦 Migrating ${app} app (${files.length} files)...`);

    for (const file of files) {
      const success = migrateFile(file, app);
      if (success) {
        totalMigrated++;
      } else {
        totalFailed++;
      }
    }
  }

  console.log('\n📊 Migration Summary:');
  console.log(`   ✅ Migrated: ${totalMigrated} files`);
  console.log(`   ❌ Failed: ${totalFailed} files`);
  console.log('\n🎉 Migration complete!');
}

main();
