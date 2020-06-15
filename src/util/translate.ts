import { join } from 'path';

import { directories } from './directories';
import { get } from './get';

// Import every translation from the translations spreadsheet.
const translations: obj[] = get(join(directories.sanitized, 'Translations.json')).filter(
  (translation) => !translation.plural
);

// When trying to find translations for items, we'll ignore these tabs as they
// represent the translations for the variations and patterns of furnitures, not
// the actual furniture, in addition to having the same ID of the furniture. As
// it has the same IDs, we'll ignore these tabs so we don't accidentally set the
// translations from these tabs, rather than the tabs we want.
const ignore: string[] = ['Furniture Variants', 'Furniture Patterns'];

/**
 * Sets the translations for the given item.
 * @param item The item to translate.
 */
function translate(item: obj): void {
  // Get the ID of the item, we can't get the internal ID of the item as we
  // can't use that property for all items. For recipes, each recipe has an
  // entry, craftedItemInternalId, which represents the internal ID of the
  // item the recipe represents.

  // If the item isn't a recipe, we get the item's internal ID, but if that
  // propery doesn't exist, we get the item's filename as some items use that
  // as their internal ID, for example, villagers.
  const id = item.craftedItemInternalId ?? item.internalId ?? item.filename;

  // Find every translation for the given internal ID.
  const options = translations.filter((translation) => translation.internalIds.includes(id));

  let translation = options.find((translation) => !ignore.includes(translation.sourceSheet));

  // Translations for villagers are special as they have translations for their
  // name and catchphrase, each having the same ID (the villager's filename). So
  // we manually set the translation for each to be safe.
  if (item.sourceSheet === 'Villagers') {
    translation = options.find((translation) => translation.sourceSheet === 'Villagers');

    // Set the translation for the villager's catchphrase.
    item.catchphrases = options.find((translation) => translation.sourceSheet === 'Villagers Catch Phrase') ?? null;
  }

  // If the item has a variation, set the translation for the variation.
  if (item.hasOwnProperty('variation')) {
    item.variantTranslations = options.find((translation: any) => item.variation === translation.english) ?? null;
  }

  // And do the same for the item's pattern.
  if (item.hasOwnProperty('pattern')) {
    item.patternTranslations = options.find((translation) => item.pattern === translation.english) ?? null;
  }

  // Each recipe has an entry, 'craftedItemInternalId', which represents the
  // internal ID of the item the recipe represents. So we set the translations
  // of the recipe to the translation of that item.
  if (item.sourceSheet === 'Recipes') {
    translation = options.find((translation: any) => !ignore.includes(translation.sourceSheet));
  }

  // If we can't find a translation using the item's ID, we'll try to find one
  // in a brute-force like attempt by finding a translation with the same name.
  if (!translation) {
    translation = translations.find((translation: any) => translation.english === (item.name ?? item.event));
  }

  // If the item is an achievement just set it to undefined, as the IDs of
  // some achievements are the same of other items, and, from my experience,
  // achievements shouldn't/don't have any translations.
  if (item.sourceSheet === 'Achievements') {
    translation = undefined;
  }

  item.translations = translation ?? null;
}

export { translate };
