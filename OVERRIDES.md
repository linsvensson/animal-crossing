## Overrides

Some values from the source spreadsheets can be replaced with your own, sourced
from a dedicated tab in **your own** spreadsheet. This is how, for example, the
achievement criteria text and its translations are customised — the official
spreadsheet has no achievement translations at all, so this tab is the only
place they can come from.

Translators contribute simply by editing that tab, using the same language
columns the rest of the sheet already uses.

### One tab for the whole project

There is a single overrides tab, and rows are grouped by a **`context`** column,
so the same tab can override many categories — not just achievements. Each row:

| context | info | en_us | en_gb | de | es_es | es_us | ru | it | fr | fr_us | nl_nl | ja_jp | ko | zh_cn | zh_hk |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Achievement criteria | 86 | Awarded for… | | Verliehen für… | | | | | | | | | | | |

- **`context`** — tags what the row overrides. A handler only reads its own rows
  (achievements read `Achievement criteria`).
- **`info`** — identifies the item. For achievements this is the `internalId`
  (e.g. `86` for the "(island name) Icons" achievement).
- **language columns** — the text in each language. `en_us` is both the English
  criteria text and its English translation, so translators just fill the rest.

### Setup (one-time)

1. In your spreadsheet, add a new tab named **`Overrides`** (or another name — if
   you rename it, change `OVERRIDE_TAB` in [`src/util/overrides.ts`](src/util/overrides.ts)).
2. Give it the columns above (copy the header row from your existing translation
   tab, then add `context` and `info` in front). The header row must be row 1.
3. Confirm `overridesId` in [`src/util/spreadsheets.ts`](src/util/spreadsheets.ts)
   holds your spreadsheet's ID. Leaving it empty disables overrides entirely.
4. The Google account you authorise the converter with must be able to read the
   spreadsheet.

### Adding an achievement override

Add a row with `context = Achievement criteria`, `info = <internalId>`, your
English text in `en_us`, and any translations in the other columns. Leave a
language blank to leave it as `null`. Then rebuild:

```
nvm use 20
npm run build:src && npm run start
```

The result lands on the achievement as `achievementCriteria` (the `en_us` text)
and a new `criteriaTranslations` object.

### How languages map

The sheet keeps your familiar codes; the converter maps them onto this module's
`Translation` schema in [`src/util/overrides.ts`](src/util/overrides.ts):

| sheet | module | | sheet | module |
|---|---|---|---|---|
| en_us | uSen | | nl_nl | eUnl |
| en_gb | eUen | | ja_jp | jPja |
| de | eUde | | ko | kRko |
| es_es | eUes | | zh_cn | cNzh |
| es_us | uSes | | zh_hk | tWzh *(approx: both Traditional)* |
| ru | eUru | | fr | eUfr |
| it | eUit | | fr_us | uSfr |

> **`pl`, `pt_pt`, `pt_br` have no equivalent** in this module's `Translation`
> schema, so translations in those columns are currently dropped from the
> output. Adjust `localeMap`/`translationKeys` in `overrides.ts` if you need them.

### Overriding another category later

In that category's handler, call `applyOverrides` before it writes, then add
rows with a new `context` value:

```ts
import { applyOverrides } from '../util/overrides.js';

applyOverrides(villagers, {
  context: 'Villager bio',
  key: 'filename',          // the item field matched against the `info` column
  textField: 'bio',
  translationsField: 'bioTranslations',
});
```
