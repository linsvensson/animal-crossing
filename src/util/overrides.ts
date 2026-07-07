import { existsSync } from 'fs';
import { join } from 'path';

import { directories } from './directories.js';
import { get } from './get.js';
import { obj } from '../types/object.js';

// This util lets you override values that come from the spreadsheets with your
// own, sourced from a dedicated tab in your own spreadsheet (see OVERRIDES.md).
//
// The tab holds one row per override, and a single tab covers the whole
// project: rows are grouped by their `context` column, so achievements are just
// the first use. Each row is:
//
//   | context             | info         | en_us | de  | es_es | ... |
//   | Achievement criteria | ChangeSymbol | ...   | ... | ...   | ... |
//
// - `context` tags what the row overrides, so a handler only picks up its rows.
// - `info` identifies the item (e.g. an achievement's `internalId`).
// - the remaining columns are the text in each language, using the same codes
//   the rest of the sheet already uses so translators aren't confused.

// The name of the tab, kept in sync with `spreadsheets.ts` and the sheet.
export const OVERRIDE_TAB = 'overrides';

// Maps the locale columns used in the spreadsheet onto this module's
// `Translation` schema keys. Columns with no equivalent in the schema (pl,
// pt_pt, pt_br) are intentionally left out, and zh_hk is mapped to tWzh as both
// are Traditional Chinese.
const localeMap: Record<string, string> = {
  en_us: 'uSen',
  en_gb: 'eUen',
  de: 'eUde',
  es_es: 'eUes',
  es_us: 'uSes',
  ru: 'eUru',
  it: 'eUit',
  fr: 'eUfr',
  fr_us: 'uSfr',
  nl_nl: 'eUnl',
  ja_jp: 'jPja',
  ko: 'kRko',
  zh_cn: 'cNzh',
  zh_hk: 'tWzh',
};

// Every key in this module's `Translation` schema, in order, so an assembled
// translations object is shaped identically to every other one in the database.
const translationKeys: string[] = [
  'eUde', 'eUen', 'eUit', 'eUnl', 'eUru', 'eUfr', 'eUes',
  'uSen', 'uSfr', 'uSes', 'jPja', 'kRko', 'tWzh', 'cNzh',
];

interface OverrideOptions {
  /** The `context` value that tags rows for this override, e.g. 'Achievement criteria'. */
  context: string;

  /** The item field matched against the sheet's `info` column, e.g. 'internalId'. */
  key: string;

  /** The field overwritten with the English (`en_us`) text, e.g. 'achievementCriteria'. */
  textField: string;

  /** The field that holds the assembled translations object, e.g. 'criteriaTranslations'. */
  translationsField: string;
}

/**
 * Returns whether a cell holds a usable value, i.e. it isn't missing or blank.
 */
function filled(value: any): boolean {
  return value !== undefined && value !== null && value !== '';
}

/**
 * Builds a `Translation`-shaped object from a row, mapping the sheet's locale
 * columns onto this module's schema and leaving every language that wasn't
 * provided as null.
 * @param  row The spreadsheet row to read the translations from.
 * @return     A translations object matching the `Translation` type.
 */
function buildTranslations(row: obj): obj {
  const translations: obj = {};

  for (const key of translationKeys) {
    translations[key] = null;
  }

  for (const [column, schemaKey] of Object.entries(localeMap)) {
    if (filled(row[column])) {
      translations[schemaKey] = row[column];
    }
  }

  translations.plural = false;

  return translations;
}

/**
 * Reads the override tab, returning an empty array if the overrides spreadsheet
 * hasn't been configured or downloaded yet.
 */
function load(): obj[] {
  const path: string = join(directories.overrides, `${OVERRIDE_TAB}.json`);

  return existsSync(path) ? get(path) : [];
}

/**
 * Applies the spreadsheet-driven overrides onto the given items, mutating them
 * in place. Only rows whose `context` matches `options.context` are considered,
 * and each such row overrides the item whose `[options.key]` equals the row's
 * `info` value.
 * @param items   The items to apply overrides to.
 * @param options Describes which rows to use and where their values go.
 */
export function applyOverrides(items: obj[], options: OverrideOptions): void {
  const rows: obj[] = load().filter((row) => row.context === options.context);

  for (const row of rows) {
    const item: obj | undefined = items.find((item) => String(item[options.key]) === String(row.info));

    // A missing item usually means a typo in `info` or an item that no longer
    // exists, so we warn rather than fail the whole build.
    if (!item) {
      console.warn(`[overrides] ${options.context}: no item with ${options.key} === '${row.info}', skipping.`);
      continue;
    }

    // The en_us column is both the item's English text and its translation, so
    // we only overwrite the text field when it's actually provided.
    if (filled(row.en_us)) {
      item[options.textField] = row.en_us;
    }

    item[options.translationsField] = buildTranslations(row);
  }
}
