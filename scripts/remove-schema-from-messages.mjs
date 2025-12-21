#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';

function removeSchema(filePath) {
  console.log(`Processing: ${filePath}`);
  const content = readFileSync(filePath, 'utf-8');
  const json = JSON.parse(content);
  
  delete json.$schema;
  
  writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf-8');
  console.log(`✅ Removed $schema from: ${filePath}`);
}

removeSchema('apps/sound-blue/project.inlang/messages/en.json');
removeSchema('apps/sound-blue/project.inlang/messages/ko.json');
removeSchema('apps/tools/project.inlang/messages/en.json');
removeSchema('apps/tools/project.inlang/messages/ko.json');

console.log('\n🎉 All $schema keys removed!');
