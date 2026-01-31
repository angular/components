## AI assistance disclosure
This work was implemented by AI tools (Claude Opus 4.5 and GPT-5.2-Codex) under my orchestration.

## Live Demo & Validation
**[View Interactive Storybook & Matrix Test Suite](https://kbrilla.github.io/temporal-adapter-demo/)**
Comprehensive playground demonstrating:
*   Integration with Material Datepicker/Timepicker
*   10+ Calendar systems (Japanese, Hebrew, Chinese, etc.)
*   Automated Matrix Tests verifying all adapter operations

## Summary
Add a Temporal-based `DateAdapter` for Angular Material datepicker, supporting date-only, date+time, and timezone-aware date+time use cases.

Fixes #25753

## Background
Temporal is a Stage 3 TC39 proposal providing immutable date/time primitives with explicit calendar and timezone semantics. This adapter enables Material datepicker to work with Temporal (native or polyfilled) without relying on JS `Date` as the internal model. The implementation follows patterns from existing adapters in this repo, especially `NativeDateAdapter`.

## Scope / what’s in this PR
- **Unified adapter**: `TemporalDateAdapter` (The primary 3-in-1 adapter recommended for general use). Supports switching modes via configuration:
  - `date` → `Temporal.PlainDate`
  - `datetime` → `Temporal.PlainDateTime`
  - `zoned` → `Temporal.ZonedDateTime`
- **Demonstration / Split adapters**: A set of 4 additional adapters illustrating different architectural splittings and strict type handling. These serve as architectural examples:
  - `PlainDateAdapter`: Strictly for `Temporal.PlainDate`.
  - `PlainDateTimeAdapter`: Strictly for `Temporal.PlainDateTime`.
  - `ZonedDateTimeAdapter`: Strictly for `Temporal.ZonedDateTime`.
  - `PlainTemporalAdapter`: A hybrid handling both `PlainDate` and `PlainDateTime`.
- **Formatting** uses `Intl.DateTimeFormatOptions` with Temporal’s locale formatting.
- **No runtime dependency** is added; consumers supply a Temporal implementation (native or polyfill).

## Configuration
### Unified adapter (`TemporalDateAdapter` / `MatTemporalDateAdapterOptions`)
**Defaults**
- `calendar`: `iso8601`
- `outputCalendar`: same as `calendar`
- `mode`: `date`
- `overflow`: `reject`
- `timezone`: system timezone (only when `mode: 'zoned'`)
- `disambiguation`, `offset`, `rounding`: Temporal defaults (only when `mode: 'zoned'`)

**Options**
- `calendar`: calendar system to use for calculations.
- `outputCalendar`: calendar system to use for output/formatting when different from calculations (MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/PlainDate/withCalendar, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/ZonedDateTime/withCalendar).
- `mode`: `date | datetime | zoned`.
- `timezone` (zoned only): IANA ID like `Europe/Warsaw` or `UTC`.
- `disambiguation` (zoned only): `'compatible' | 'earlier' | 'later' | 'reject'` for DST gaps/overlaps (MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/PlainDateTime/toZonedDateTime, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/ZonedDateTime/from).
- `offset` (zoned only): `'use' | 'ignore' | 'reject' | 'prefer'` for offset ambiguity on parse (MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/ZonedDateTime/from).
- `rounding` (zoned only): `{smallestUnit, roundingIncrement?, roundingMode?}` applied to zoned output (MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/ZonedDateTime/round).
- `firstDayOfWeek`: overrides the locale-derived week start.
- `overflow`: `reject` throws on invalid dates, `constrain` clamps to the nearest valid date.

**Notes**
- `outputCalendar` uses `withCalendar` for display fields only; it does not re-resolve the instant, so `disambiguation`/`offset` are not applied during output conversion.
- If `disambiguation`, `offset`, or `rounding` aren’t provided, the adapter relies on Temporal’s defaults.
- `overflow` defaults to `reject` to avoid silent clamping and better match strict validation expectations.

### Split adapters
**`PlainTemporalAdapterOptions`** (for `PlainTemporalAdapter`)
- `mode` (default: `datetime`): `date` → `PlainDate`, `datetime` → `PlainDateTime`.
- `calendar` (default: `iso8601`): calendar system for calculations.
- `outputCalendar` (default: same as `calendar`): calendar system for output/formatting.
- `firstDayOfWeek` (default: locale-derived): overrides the locale-derived week start.
- `overflow` (default: `reject`): `reject` throws on invalid dates, `constrain` clamps.

**`ZonedDateTimeAdapterOptions`** (for `ZonedDateTimeAdapter`)
- `calendar` (default: `iso8601`): calendar system for calculations.
- `outputCalendar` (default: same as `calendar`): calendar system for output/formatting (MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/ZonedDateTime/withCalendar).
- `timezone` (default: system timezone): IANA ID like `Europe/Warsaw` or `UTC`.
- `disambiguation`: `'compatible' | 'earlier' | 'later' | 'reject'` for DST gaps/overlaps (MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/PlainDateTime/toZonedDateTime, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/ZonedDateTime/from).
- `offset`: `'use' | 'ignore' | 'reject' | 'prefer'` for offset ambiguity on parse (MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/ZonedDateTime/from).
- `rounding`: `{smallestUnit, roundingIncrement?, roundingMode?}` applied to zoned output (MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/ZonedDateTime/round).
- `firstDayOfWeek` (default: locale-derived): overrides the locale-derived week start.
- `overflow` (default: `reject`): `reject` throws on invalid dates, `constrain` clamps.

## Examples
### Unified adapter option examples
- `calendar`
  ```ts
  provideTemporalDateAdapter({mode: 'date', calendar: 'japanese'});
  const value = Temporal.PlainDate.from('2024-01-15').withCalendar('japanese');
  // Output example: adapter.format(value, {year: 'numeric'}) -> (Japanese era year, locale-dependent)
  ```
  → display and calculations use the Japanese calendar.
- `outputCalendar`
  ```ts
  provideTemporalDateAdapter({mode: 'date', calendar: 'iso8601', outputCalendar: 'japanese'});
  const value = Temporal.PlainDate.from('2024-01-15');
  // Output example: adapter.format(value, {year: 'numeric'}) -> (Japanese era year, locale-dependent)
  ```
  → calculations use ISO, output uses the Japanese calendar.
- `mode`
  ```ts
  provideTemporalDateAdapter({mode: 'datetime'});
  const value = Temporal.PlainDateTime.from('2024-01-15T12:30');
  // Output examples:
  // mode: 'date'    -> adapter.toIso8601(value) -> 2024-01-15
  // mode: 'datetime'-> adapter.toIso8601(value) -> 2024-01-15
  // mode: 'zoned'   -> adapter.toIso8601(value) -> 2024-01-15T12:30:00+00:00[UTC]
  ```
  → values are `Temporal.PlainDateTime`.
- `timezone`
  ```ts
  provideTemporalDateAdapter({mode: 'zoned', timezone: 'UTC'});
  const value = Temporal.ZonedDateTime.from('2024-01-15T12:30[UTC]');
  // Output example: adapter.toIso8601(value) -> 2024-01-15T12:30:00+00:00[UTC]
  ```
  → zoned values in UTC.
- `disambiguation`
  ```ts
  provideTemporalDateAdapter({mode: 'zoned', timezone: 'America/New_York', disambiguation: 'later'});
  const value = Temporal.PlainDateTime.from('2024-11-03T01:05').toZonedDateTime('America/New_York', {
    disambiguation: 'later',
  });
  // Output examples (same local time):
  // compatible -> adapter.toIso8601(value) -> 2024-11-03T01:05:00-04:00[America/New_York]
  // earlier    -> adapter.toIso8601(value) -> 2024-11-03T01:05:00-04:00[America/New_York]
  // later      -> adapter.toIso8601(value) -> 2024-11-03T01:05:00-05:00[America/New_York]
  // reject     -> adapter.setTime(...) throws for ambiguous/nonexistent time
  ```
  → ambiguous times choose the later instant.
- `offset`
  ```ts
  provideTemporalDateAdapter({mode: 'zoned', offset: 'ignore'});
  const value = Temporal.ZonedDateTime.from('2019-12-23T12:00:00-02:00[America/Sao_Paulo]', {
    offset: 'ignore',
  });
  // Output examples (same input string):
  // use    -> adapter.toIso8601(value) -> 2019-12-23T11:00:00-03:00[America/Sao_Paulo]
  // ignore -> adapter.toIso8601(value) -> 2019-12-23T12:00:00-03:00[America/Sao_Paulo]
  // prefer -> adapter.toIso8601(value) -> 2019-12-23T12:00:00-03:00[America/Sao_Paulo]
  // reject -> adapter.deserialize(...) -> invalid
  ```
  → keep local time when offset conflicts with zone on parse.
- `rounding`
  ```ts
  provideTemporalDateAdapter({mode: 'zoned', rounding: {smallestUnit: 'minute', roundingIncrement: 5}});
  const value = Temporal.ZonedDateTime.from('2024-01-15T12:34:56[UTC]');
  // Output examples (roundingMode):
  // halfExpand -> adapter.toIso8601(value) -> 2024-01-15T12:35:00+00:00[UTC]
  // floor      -> adapter.toIso8601(value) -> 2024-01-15T12:30:00+00:00[UTC]
  // ceil       -> adapter.toIso8601(value) -> 2024-01-15T12:35:00+00:00[UTC]
  // trunc      -> adapter.toIso8601(value) -> 2024-01-15T12:30:00+00:00[UTC]
  ```
  → outputs rounded to 5-minute steps.
- `firstDayOfWeek`
  ```ts
  provideTemporalDateAdapter({firstDayOfWeek: 1});
  // Output example: adapter.getFirstDayOfWeek() -> 1
  ```
  → weeks start on Monday.
- `overflow`
  ```ts
  provideTemporalDateAdapter({overflow: 'reject'});
  // Output example (reject): adapter.createDate(2024, 1, 31) -> throws
  provideTemporalDateAdapter({overflow: 'constrain'});
  // Output example (constrain): adapter.createDate(2024, 1, 31) -> 2024-02-29
  ```
  → invalid dates throw; invalid dates clamp.

**Form control example (overflow)**
```ts
provideTemporalDateAdapter({mode: 'date', overflow: 'constrain'});
const control = new FormControl(Temporal.PlainDate.from({year: 2024, month: 2, day: 31}));
```
Effect: the value is clamped to the last valid day of the month (e.g. 2024-02-29) instead of throwing.

### Split adapter option examples
```ts
providePlainTemporalAdapter({mode: 'date', calendar: 'iso8601', outputCalendar: 'japanese'});
provideZonedDateTimeAdapter({timezone: 'UTC', disambiguation: 'reject', rounding: {smallestUnit: 'minute'}});
```

## Usage examples
```ts
import {provideTemporalDateAdapter} from '@angular/material-temporal-adapter';

provideTemporalDateAdapter({mode: 'date'});
provideTemporalDateAdapter({mode: 'datetime'});
provideTemporalDateAdapter({mode: 'zoned'}); // default: system timezone
provideTemporalDateAdapter({mode: 'zoned', timezone: 'UTC'});
```

```ts
import {
  providePlainTemporalAdapter,
  provideZonedDateTimeAdapter,
} from '@angular/material-temporal-adapter/adapter/split';

providePlainTemporalAdapter({mode: 'date'});
providePlainTemporalAdapter({mode: 'datetime'});
provideZonedDateTimeAdapter({timezone: 'Europe/Warsaw'});
```

## Migration patterns
- **From `NativeDateAdapter` (`Date`)**: switch to `mode: 'date'`, replace `Date` with `Temporal.PlainDate`. If you rely on timezone/time-of-day behavior, use `mode: 'zoned'` with the system timezone instead.
- **From `MomentDateAdapter`/`LuxonDateAdapter` (date+time)**: use `mode: 'datetime'`, replace values with `Temporal.PlainDateTime`.
- **From timezone-aware usage**: use `mode: 'zoned'` + `timezone`, replace values with `Temporal.ZonedDateTime`.
- **From Luxon `defaultOutputCalendar`**: keep `calendar` for calculations, set `outputCalendar` for display.
- **From apps relying on DST/offset rules or rounding**: configure `disambiguation`, `offset`, and `rounding` in `zoned` mode.
- **Incremental/explicit type choice**: use split adapters (`PlainTemporalAdapter` or `ZonedDateTimeAdapter`).
- If a Temporal polyfill is needed, load it before bootstrapping the app.
- If you provide custom `MAT_DATE_FORMATS`, ensure they are `Intl.DateTimeFormatOptions` (Temporal ignores parse formats and parses ISO strings only).

**Custom display formats**
```ts
import {MatDateFormats} from '@angular/material/core';
import {provideTemporalDateAdapter, MAT_TEMPORAL_DATE_FORMATS} from '@angular/material-temporal-adapter';

const MY_TEMPORAL_FORMATS = {
  ...MAT_TEMPORAL_DATE_FORMATS,
  display: {
    ...MAT_TEMPORAL_DATE_FORMATS.display,
    dateInput: {year: 'numeric', month: 'long', day: 'numeric'},
  },
} satisfies MatDateFormats;

bootstrapApplication(AppComponent, {
  providers: [provideTemporalDateAdapter(MY_TEMPORAL_FORMATS, {mode: 'date'})],
});
```

**MAT token notes**
- `MAT_DATE_LOCALE`: locale string used for formatting and week info.
- `MAT_DATE_FORMATS`: must be `Intl.DateTimeFormatOptions` (parse formats ignored).

## Comparison and mapping
- Follows the same `DateAdapter` contract as `NativeDateAdapter`, `MomentDateAdapter`, `LuxonDateAdapter`, and `DateFnsAdapter`.
- Uses `Intl.DateTimeFormatOptions` for display formatting (like `NativeDateAdapter`), but the backing values are Temporal types instead of `Date`.

**Option mapping (approximate)**
| Existing adapter | Option | Temporal equivalent | Notes |
| --- | --- | --- | --- |
| NativeDateAdapter | n/a | `mode: 'date'` | Temporal `PlainDate` is the closest analogue to `Date` for date-only use. |
| MomentDateAdapter | `useUtc: true` | `mode: 'zoned', timezone: 'UTC'` | Use zoned+UTC for UTC-centric workflows. |
| MomentDateAdapter | `strict: true` | `overflow: 'reject'` | Temporal parsing is ISO-only; `overflow` controls invalid date creation. |
| LuxonDateAdapter | `useUtc: true` | `mode: 'zoned', timezone: 'UTC'` | Similar UTC behavior. |
| LuxonDateAdapter | `firstDayOfWeek` | `firstDayOfWeek` | Same semantics. |
| LuxonDateAdapter | `defaultOutputCalendar` | `outputCalendar` | Calendar used for output/formatting (calculations use `calendar`). |
| DateFnsAdapter | n/a | `MAT_DATE_LOCALE` + `MAT_DATE_FORMATS` | Temporal adapter also uses locale + formats. |

## Notable design choices / dilemmas (with resolution)
### 1) Temporal typings source (TypeScript not shipping them yet)
TypeScript does not currently ship `lib.esnext.temporal` in the version used here, so this PR includes local declarations to type the adapter until the repo upgrades to a TS version that includes Temporal libs.

Reference: https://github.com/microsoft/TypeScript/pull/62628

### 2) API Extractor goldens
API Extractor had trouble resolving the global `Temporal` namespace in this setup. Additionally, existing adapter packages (moment/luxon/date-fns) don’t have API goldens. For consistency and to avoid introducing a blocked/flaky step, this PR does not add API golden coverage for this adapter package.

### 3) Formatting implementation note
`Intl.DateTimeFormat` is used for localization (same overall approach as other adapters). Zoned values are formatted using the configured timezone.

## Tests
- Unit tests cover all `mode` variants and timezone behavior, plus creation/parsing/formatting/time operations.
- Latest run: `pnpm test src/material-temporal-adapter --no-watch` on Chromium (local).
  - Result: 141 passed, 2 skipped (Islamic calendar suite skipped because `islamic` calendar is not supported by the current Temporal implementation).
- Note: split adapters (`PlainTemporalAdapter`, `ZonedDateTimeAdapter`) are not explicitly covered by a dedicated spec yet.

## Open questions (feedback requested)
1) Calendar type: keep `calendar` as `string` (max flexibility) vs trying to constrain it (risk of being incomplete/locale-dependent).
2) Positioning: should this adapter be documented as “ready” like other adapters, or called out as “early” given current ecosystem support for Temporal?
3) Should `mode` be required for the unified adapter (no implicit default), or keep the default `date` mode?
4) Should `overflow` default to `reject` (strict) or align with Temporal’s `constrain` default?
5) Should we add migration examples to the public docs (datepicker/timepicker) instead of only in the PR description?


