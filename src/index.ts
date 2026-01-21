import { sheets } from '@lin/sheets';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { directories } from './util/directories.js';
import { readdir } from './util/readdir.js';
import { spreadsheets } from './util/spreadsheets.js';

// Create __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main(): Promise<void> {
  // Make sure that the directories used throughout this project exist.
  for (const directory of Object.values(directories)) {
    if (!existsSync(directory)) mkdirSync(directory, { recursive: true });
  }

  // Convert and download each spreadsheet as a JSON file, saved under 'json'.
  await sheets(spreadsheets, { verbose: true });

  // Combine translations into a single file
  await import('./scripts/translations.js');

  // Sanitize JSON files
  await import('./scripts/sanitize.js');

  // Process all handler scripts
  const handlers: string[] = readdir(join(__dirname, 'handlers'));
  for (const handler of handlers) {
    await import(handler);
  }

  // Merge items with recipes
  await import('./scripts/recipes.js');

  // Combine JSON files by categories
  await import('./scripts/combine.js');
}

main();