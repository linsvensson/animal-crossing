import { Spreadsheet } from '@lin/sheets';
import { directories } from './directories.js';
import { OVERRIDE_TAB } from './overrides.js';

// The ID of your own spreadsheet that holds the overrides tab (the long random
// string in its URL). Leave it empty to disable overrides entirely; set it to
// enable them. See OVERRIDES.md.
const overridesId = '1B8hwFJEfFdGQ8UVPB4GcBpyagD2ugkOWfw2eTWkLJOU';

/**
 * Represents a list of Google Spreadsheets that we'll convert to JSON, the
 * spreadsheets being: The Animal Crossing: New Horizons spreadsheet, the
 * Translations spreadsheet, and, if configured, your own overrides spreadsheet.
 */
export const spreadsheets: Spreadsheet[] = [
  {
    id: '1mo7myqHry5r_TKvakvIhHbcEAEQpSiNoNQoIS8sMpvM',
    exclude: ['Editor Read Me', 'Read Me'],
    dir: directories.raw,
  },

  {
    id: '1MMbsvDfu59OY9YBEAfHhFJ6O8vRTllNFgMrX7RBZuyI',
    exclude: ['Readme', 'Changelog'],
    dir: directories.translations,
  },

  // Only convert the overrides spreadsheet if an ID has been provided, so the
  // build works out of the box until you opt in.
  ...(overridesId
    ? [{ id: overridesId, include: [OVERRIDE_TAB], dir: directories.overrides }]
    : [])
];
