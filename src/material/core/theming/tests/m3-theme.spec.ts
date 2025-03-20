import {runfiles} from '@bazel/runfiles';
import * as path from 'path';
import {parse} from 'postcss';
import {compileString} from 'sass';

import {createLocalAngularPackageImporter} from '../../../../../tools/sass/local-sass-importer.js';

// Note: For Windows compatibility, we need to resolve the directory paths through runfiles
// which are guaranteed to reside in the source tree.
const testDir = path.join(runfiles.resolvePackageRelative('../_all-theme.scss'), '../tests');
const packagesDir = path.join(runfiles.resolveWorkspaceRelative('src/cdk/_index.scss'), '../..');

const localPackageSassImporter = createLocalAngularPackageImporter(packagesDir);

/** Transpiles given Sass content into CSS. */
function transpile(content: string) {
  return compileString(
    `
        @use '../../../index' as mat;

        $internals: _mat-theming-internals-do-not-access;

        $theme: mat.define-theme();

        ${content}
      `,
    {
      loadPaths: [testDir],
      importers: [localPackageSassImporter],
    },
  ).css.toString();
}

function union<T>(...sets: Set<T>[]): Set<T> {
  return new Set(sets.flatMap(s => [...s]));
}

function intersection<T>(set: Set<T>, ...sets: Set<T>[]): Set<T> {
  return new Set([...set].filter(i => sets.every(s => s.has(i))));
}

/** Expects the given warning to be reported in Sass. */
function expectWarning(message: RegExp) {
  expect(getMatchingWarning(message)).withContext('Expected warning to be printed.').toBeDefined();
}

/** Expects the given warning not to be reported in Sass. */
function expectNoWarning(message: RegExp) {
  expect(getMatchingWarning(message))
    .withContext('Expected no warning to be printed.')
    .toBeUndefined();
}

/**
 * Gets first instance of the given warning reported in Sass. Dart sass directly writes
 * to the `process.stderr` stream, so we spy on the `stderr.write` method. We
 * cannot expect a specific amount of writes as Sass calls `stderr.write` multiple
 * times for a warning (e.g. spacing and stack trace)
 */
function getMatchingWarning(message: RegExp) {
  const writeSpy = process.stderr.write as jasmine.Spy;
  return (writeSpy.calls?.all() ?? []).find(
    (s: jasmine.CallInfo<typeof process.stderr.write>) =>
      typeof s.args[0] === 'string' && message.test(s.args[0]),
  );
}

describe('M3 theme', () => {
  it('should emit all styles under the given selector', () => {
    const root = parse(
      transpile(`
      html {
        @include mat.all-component-themes($theme);
        @include mat.all-component-bases($theme);
        @include mat.all-component-colors($theme);
        @include mat.all-component-typographies($theme);
        @include mat.all-component-densities($theme);
      }
    `),
    );
    const selectors = new Set<string>();
    root.walkRules(rule => {
      selectors.add(rule.selector);
    });
    expect(Array.from(selectors)).toEqual(['html']);
  });

  it('should only emit CSS variables', () => {
    const root = parse(transpile(`html { @include mat.all-component-themes($theme); }`));
    const nonVarProps: string[] = [];
    root.walkDecls(decl => {
      if (!decl.prop.startsWith('--')) {
        nonVarProps.push(decl.prop);
      }
    });
    expect(nonVarProps).toEqual([]);
  });

  it('should not have overlapping tokens between theme dimensions', () => {
    const css = transpile(`
        $theme: mat.define-theme();
        base {
          @include mat.all-component-bases($theme);
        }
        color {
          @include mat.all-component-colors($theme);
        }
        typography {
          @include mat.all-component-typographies($theme);
        }
        density {
          @include mat.all-component-densities($theme);
        }
    `);
    const root = parse(css);
    const propSets: {[key: string]: Set<string>} = {};
    root.walkRules(rule => {
      rule.walkDecls(decl => {
        propSets[rule.selector] = propSets[rule.selector] || new Set();
        propSets[rule.selector].add(decl.prop);
      });
    });
    let overlap = new Set();
    for (const [dimension1, props1] of Object.entries(propSets)) {
      for (const [dimension2, props2] of Object.entries(propSets)) {
        if (dimension1 !== dimension2) {
          overlap = union(overlap, intersection(props1, props2));
        }
      }
    }
    expect([...overlap])
      .withContext('Did you forget to wrap these in `_hardcode()`?')
      .toEqual([]);
  });

  it('should throw if theme included at root', () => {
    expect(() => transpile(`@include mat.all-component-themes($theme)`)).toThrowError(
      /Calls to Angular Material theme mixins with an M3 theme must be wrapped in a selector/,
    );
  });

  describe('theme override API', () => {
    beforeEach(() => {
      spyOn(process.stderr, 'write').and.callThrough();
    });

    it('should allow overriding non-ambiguous token value', () => {
      const css = transpile(`
        div {
          @include mat.checkbox-overrides((selected-checkmark-color: magenta));
        }
      `);

      expect(css).toContain('--mat-checkbox-selected-checkmark-color: magenta');
      expectNoWarning(/`selected-checkmark-color` is deprecated/);
    });

    it('should allow overriding ambiguous token value using prefix', () => {
      const css = transpile(`
        div {
          @include mat.form-field-overrides((filled-caret-color: magenta));
        }
      `);

      expect(css).toContain('--mat-filled-text-field-caret-color: magenta');
      expect(css).not.toContain('--mat-outline-text-field-caret-color: magenta');
      expectNoWarning(/`filled-caret-color` is deprecated/);
    });

    it('should allow overriding ambiguous token value without using prefix, but warn', () => {
      const css = transpile(`
        div {
          @include mat.form-field-overrides((caret-color: magenta));
        }
      `);

      expect(css).toContain('--mat-filled-text-field-caret-color: magenta');
      expect(css).toContain('--mat-outlined-text-field-caret-color: magenta');
      expectWarning(
        /Token `caret-color` is deprecated. Please use one of the following alternatives: filled-caret-color, outlined-caret-color/,
      );
    });

    it('should error on invalid token name', () => {
      expect(() =>
        transpile(`
        div {
          @include mat.form-field-overrides((fake: magenta));
        }
      `),
      ).toThrowError(/Invalid token name `fake`./);
    });

    it('should not error when calling theme override functions', () => {
      // Ensures that no components have issues with ambiguous token names.
      expect(() =>
        transpile(`
          html {
            @include mat.core-overrides(());
            @include mat.ripple-overrides(());
            @include mat.option-overrides(());
            @include mat.optgroup-overrides(());
            @include mat.pseudo-checkbox-overrides(());
            @include mat.autocomplete-overrides(());
            @include mat.badge-overrides(());
            @include mat.bottom-sheet-overrides(());
            @include mat.button-overrides(());
            @include mat.fab-overrides(());
            @include mat.icon-button-overrides(());
            @include mat.button-toggle-overrides(());
            @include mat.card-overrides(());
            @include mat.checkbox-overrides(());
            @include mat.chips-overrides(());
            @include mat.datepicker-overrides(());
            @include mat.dialog-overrides(());
            @include mat.divider-overrides(());
            @include mat.expansion-overrides(());
            @include mat.form-field-overrides(());
            @include mat.grid-list-overrides(());
            @include mat.icon-overrides(());
            @include mat.list-overrides(());
            @include mat.menu-overrides(());
            @include mat.paginator-overrides(());
            @include mat.progress-bar-overrides(());
            @include mat.progress-spinner-overrides(());
            @include mat.radio-overrides(());
            @include mat.select-overrides(());
            @include mat.sidenav-overrides(());
            @include mat.slide-toggle-overrides(());
            @include mat.slider-overrides(());
            @include mat.snack-bar-overrides(());
            @include mat.sort-overrides(());
            @include mat.stepper-overrides(());
            @include mat.table-overrides(());
            @include mat.tabs-overrides(());
            @include mat.toolbar-overrides(());
            @include mat.tooltip-overrides(());
            @include mat.tree-overrides(());
          }
        `),
      ).not.toThrow();
    });
  });
});
