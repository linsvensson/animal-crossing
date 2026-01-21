import { statSync, readFileSync } from 'fs';
import { readdir } from './readdir.js';
import { obj } from '../types/object.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/**
 * Determines if the given path is a file.
 */
function isFile(path: string): boolean {
  return statSync(path).isFile();
}

/**
 * A helper for get function.
 */
function loop(array: obj[], file: string): obj[] {
  if (file.endsWith('.json')) {
    // Synchronously read JSON
    const data = JSON.parse(readFileSync(file, 'utf-8'));
    return [...array, ...data];
  } else {
    // Use Node require for JS files (CommonJS or default ESM)
    const mod = require(file);
    return [...array, ...(mod.default ?? mod)];
  }
}

/**
 * Synchronous get function that returns obj[] just like before.
 */
export function get(path: string[] | string): obj[] {
  let files: string[];

  if (typeof path === 'string') {
    files = isFile(path) ? [path] : readdir(path);
  } else {
    files = path;
  }

  return files.reduce(loop, []);
}