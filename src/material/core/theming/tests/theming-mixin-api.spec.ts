import {parse, Root, Rule} from 'postcss';
import {compileString} from 'sass';
import {runfiles} from '@bazel/runfiles';
import * as path from 'path';

import {compareNodes} from '../../../../../tools/postcss/compare-nodes';
import {createLocalAngularPackageImporter} from '../../../../../tools/sass/local-sass-importer';
import {pathToFileURL} from 'url';

// Note: For Windows compatibility, we need to resolve the directory paths through runfiles
// which are guaranteed to reside in the source tree.
const testDir = path.join(runfiles.resolvePackageRelative('../_all-theme.scss'), '../tests');
const packagesDir = path.join(runfiles.resolveWorkspaceRelative('src/cdk/_index.scss'), '../..');

const localPackageSassImporter = createLocalAngularPackageImporter(packagesDir);

const mdcSassImporter = {
  findFileUrl: (url: string) => {
    if (url.toString().startsWith('@material')) {
      return pathToFileURL(path.join(runfiles.resolveWorkspaceRelative('./node_modules'), url));
    }
    return null;
  },
};

describe('theming api', () => {
  /** Map of known selectors for density styles and their corresponding AST rule. */
  let knownDensitySelectors: Map<string, Rule>;

  // Before all tests, we collect all nodes specific to density styles. We can then
  // use this check how density styles are generated. i.e. if they are properly scoped to a
  // given selector.
  beforeAll(() => {
    knownDensitySelectors = new Map();
    parse(transpile(`@include mat.all-component-densities(0);`)).each(node => {
      if (node.type === 'rule') {
        node.selectors.forEach(s => knownDensitySelectors.set(s, node));
      }
    });
  });

  it('should warn if color styles are duplicated', () => {
    spyOn(process.stderr, 'write');

    transpile(`
      $theme: mat.define-light-theme((
        color: (
          primary: mat.define-palette(mat.$red-palette),
          accent: mat.define-palette(mat.$red-palette),
        )
      ));

      @include mat.all-component-themes($theme);

      .dark-theme {
        @include mat.all-component-themes($theme);
      }
    `);

    expectWarning(/The same color styles are generated multiple times/);
  });

  it('should not warn if color styles and density are not duplicated', () => {
    const parsed = parse(
      transpile(`
      $theme: mat.define-light-theme((
        color: (
          primary: mat.define-palette(mat.$red-palette),
          accent: mat.define-palette(mat.$red-palette),
        )
      ));
      $theme2: mat.define-light-theme((
        color: (
          primary: mat.define-palette(mat.$red-palette),
          accent: mat.define-palette(mat.$blue-palette),
        )
      ));

      @include mat.all-component-themes($theme);

      .dark-theme {
        @include mat.all-component-colors($theme2);
      }
    `),
    );

    expect(hasDensityStyles(parsed, null)).toBe('all');
    expect(hasDensityStyles(parsed, '.dark-theme')).toBe('none');
    expectNoWarning(/The same color styles are generated multiple times/);
  });

  it('should be possible to modify color configuration directly', () => {
    const result = transpile(`
      $theme: mat.define-light-theme((
        color: (
          primary: mat.define-palette(mat.$red-palette),
          accent: mat.define-palette(mat.$blue-palette),
        )
      ));

      // Updates the "icon" foreground color to hotpink.
      $color: map-get($theme, color);
      $theme: map-merge($color,
        (foreground: map-merge(map-get($color, foreground), (icon: hotpink))));

      @include mat.all-component-themes($theme);
    `);

    expect(result).toContain(': hotpink');
  });

  it('should warn if default density styles are duplicated', () => {
    spyOn(process.stderr, 'write');

    const parsed = parse(
      transpile(`
      @include mat.all-component-themes((color: null));

      .dark-theme {
        @include mat.all-component-themes((color: null));
      }
    `),
    );

    expect(hasDensityStyles(parsed, null)).toBe('all');
    expect(hasDensityStyles(parsed, '.dark-theme')).toBe('all');
    expectWarning(/The same density styles are generated multiple times/);
  });

  it('should warn if density styles are duplicated', () => {
    spyOn(process.stderr, 'write');

    transpile(`
      @include mat.all-component-themes((density: -1));

      .dark-theme {
        @include mat.all-component-themes((density: -1));
      }
    `);

    expectWarning(/The same density styles are generated multiple times/);
  });

  it('should not warn if density styles are not duplicated', () => {
    spyOn(process.stderr, 'write');

    transpile(`
      @include mat.all-component-themes((density: -1));

      .dark-theme {
        @include mat.all-component-themes((density: -2));
      }
    `);

    expect(process.stderr.write).toHaveBeenCalledTimes(0);
  });

  it('should warn if typography styles are duplicated', () => {
    spyOn(process.stderr, 'write');

    transpile(`
      $theme: (typography: mat.define-typography-config(), density: null);
      @include mat.all-component-themes($theme);

      .dark-theme {
        @include mat.all-component-themes($theme);
      }
    `);

    expectWarning(/The same typography styles are generated multiple times/);
  });

  it('should not warn if typography styles are not duplicated', () => {
    spyOn(process.stderr, 'write');

    transpile(`
      @include mat.all-component-themes((
        typography: mat.define-typography-config(),
        density: null,
      ));

      .dark-theme {
        @include mat.all-component-themes((
          typography: mat.define-typography-config($font-family: "sans-serif"),
          density: null,
        ));
      }
    `);

    expect(process.stderr.write).toHaveBeenCalledTimes(0);
  });

  /**
   * Checks whether the given parsed stylesheet contains density styles scoped to
   * a given selector. If the selector is `null`, then density is expected to be
   * generated at top-level.
   */
  function hasDensityStyles(parsed: Root, baseSelector: string | null): 'all' | 'partial' | 'none' {
    expect(parsed.nodes).withContext('Expected CSS to be not empty.').toBeDefined();
    expect(knownDensitySelectors.size).not.toBe(0);
    const missingDensitySelectors = new Set(knownDensitySelectors.keys());
    const baseSelectorRegex = new RegExp(`^${baseSelector} `, 'g');

    // Go through all rules in the stylesheet and check if they match with any
    // of the density style selectors. If so, we remove it from the copied set
    // of density selectors. If the set is empty at the end, we know that density
    // styles have been generated as expected.
    parsed.nodes!.forEach(node => {
      if (node.type !== 'rule') {
        return;
      }
      node.selectors.forEach(selector => {
        if (baseSelector && selector === baseSelector) {
          // Styles emitted directly to the baseSelector are emitted to html
          // when there is no baseSelector.
          selector = 'html';
        } else {
          // Only check selectors that match the specified base selector.
          if (baseSelector && !baseSelectorRegex.test(selector)) {
            return;
          }
        }
        selector = selector.replace(baseSelectorRegex, '');
        const matchingRule = knownDensitySelectors.get(selector);
        if (matchingRule && compareNodes(node, matchingRule)) {
          missingDensitySelectors.delete(selector);
        }
      });
    });

    // If there are no unmatched density selectors, then it's confirmed that
    // all density styles have been generated (scoped to the given selector).
    if (missingDensitySelectors.size === 0) {
      return 'all';
    }
    // If no density selector has been matched at all, then no density
    // styles have been generated.
    if (missingDensitySelectors.size === knownDensitySelectors.size) {
      return 'none';
    }
    console.error('MISSING!!! ', [...missingDensitySelectors].join(','));
    return 'partial';
  }

  /** Transpiles given Sass content into CSS. */
  function transpile(content: string) {
    return compileString(
      `
        @use '../../../index' as mat;

        ${content}
      `,
      {
        loadPaths: [testDir],
        importers: [localPackageSassImporter, mdcSassImporter],
      },
    ).css.toString();
  }

  /** Expects the given warning to be reported in Sass. */
  function expectWarning(message: RegExp) {
    expect(getMatchingWarning(message))
      .withContext('Expected warning to be printed.')
      .toBeDefined();
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
});
