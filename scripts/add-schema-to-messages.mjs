#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

function addSchema(filePath) {
  console.log(`📖 Processing: ${filePath}`);
  const content = readFileSync(filePath, 'utf-8');
  const json = JSON.parse(content);
  
  const withSchema = {
    "$schema": "https://inlang.com/schema/inlang-message-format",
    ...json
  };
  
  writeFileSync(filePath, JSON.stringify(withSchema, null, 2), 'utf-8');
  console.log(`✅ Added $schema to: ${filePath}`);
}

addSchema('apps/sound-blue/project.inlang/messages/en.json');
addSchema('apps/sound-blue/project.inlang/messages/ko.json');
addSchema('apps/tools/project.inlang/messages/en.json');
addSchema('apps/tools/project.inlang/messages/ko.json');

console.log('\n🎉 All schemas added!');
