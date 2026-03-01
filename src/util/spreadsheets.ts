import { Spreadsheet } from '@lin/sheets';
import { directories } from './directories.js';

/**
 * Represents a list of Google Spreadsheets that we'll convert to JSON, the
 * spreadsheets being: The Animal Crossing: New Horizons spreadsheet, the
 * Translations spreadsheet, and the Events/Seasons spreadsheet.
 */
export const spreadsheets: Spreadsheet[] = [
  {
    id: '1x4f8LN_8MtA3-yETG8tYe8aAw8lGPJlQ7oS0aNqtSMM',
    exclude: ['Read Me'],
    dir: directories.raw,
  },

  {
    id: '1MMbsvDfu59OY9YBEAfHhFJ6O8vRTllNFgMrX7RBZuyI',
    exclude: ['Readme', 'Changelog'],
    dir: directories.translations,
  }
];
