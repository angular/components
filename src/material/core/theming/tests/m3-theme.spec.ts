import {runfiles} from '@bazel/runfiles';
import * as path from 'path';
import {parse} from 'postcss';
import {compileString} from 'sass';

import {createLocalAngularPackageImporter} from '../../../../../tools/sass/local-sass-importer';

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

  describe('theme extension API', () => {
    it('should allow overriding token value', () => {
      const css = transpile(`
        @use '../../tokens/token-utils';

        $theme: token-utils.extend-theme($theme, ((mdc, checkbox), (mat, checkbox)), (
          selected-checkmark-color: magenta
        ));

        html {
          @include mat.checkbox-theme($theme);
        }
      `);

      expect(css).toContain('--mdc-checkbox-selected-checkmark-color: magenta');
    });

    it('should not override token value for other color variant', () => {
      const css = transpile(`
        @use '../../tokens/token-utils';

        $theme: token-utils.extend-theme($theme, ((mdc, checkbox), (mat, checkbox)), (
          selected-checkmark-color: magenta
        ));

        html {
          @include mat.checkbox-theme($theme, $color-variant: secondary);
        }
      `);

      expect(css).not.toContain('--mdc-checkbox-selected-checkmark-color: magenta');
    });

    it('should allow overriding specific color variant separately', () => {
      const css = transpile(`
        @use '../../tokens/token-utils';

        $theme: token-utils.extend-theme($theme, ((mdc, checkbox), (mat, checkbox)), (
          selected-checkmark-color: magenta,
          tertiary: (
            selected-checkmark-color: cyan,
          ),
        ));

        html {
          @include mat.checkbox-theme($theme);
        }

        .tertiary {
          @include mat.checkbox-color($theme, $color-variant: tertiary);
        }
      `);

      expect(css).toContain('--mdc-checkbox-selected-checkmark-color: magenta');
      expect(css).toContain('--mdc-checkbox-selected-checkmark-color: cyan');
    });
  });

  it('should error if used on M2 theme', () => {
    expect(() =>
      transpile(`
        @use '../../tokens/token-utils';

        $theme: mat.m2-define-light-theme(mat.$m2-red-palette, mat.$m2-red-palette);

        $theme: token-utils.extend-theme($theme, ((mdc, checkbox), (mat, checkbox)), (
          selected-checkmark-color: magenta
        ));

        html {
          @include mat.checkbox-theme($theme);
        }
      `),
    ).toThrowError(/The `extend-theme` functions are only supported for M3 themes/);
  });

  it('should error on invalid namespace', () => {
    expect(() =>
      transpile(`
        @use '../../tokens/token-utils';

        $theme: token-utils.extend-theme($theme, ((mdc, checkbox), (mat, checkbocks)), (
          selected-checkmark-color: magenta
        ));

        html {
          @include mat.checkbox-theme($theme);
        }
      `),
    ).toThrowError(
      /Error extending theme: Theme does not have tokes for namespace `\(mat, checkbocks\)`/,
    );
  });

  it('should error on ambiguous shorthand token name', () => {
    expect(() =>
      transpile(`
        @use '../../tokens/token-utils';

        $theme: token-utils.extend-theme($theme, ((mdc, checkbox), (mdc, radio)), (
          selected-checkmark-color: magenta
        ));

        html {
          @include mat.checkbox-theme($theme);
        }
      `),
    ).toThrowError(
      /Error extending theme: Ambiguous token name `.*` exists in multiple namespaces: `\(mdc, checkbox\)` and `\(mdc, radio\)`/,
    );
  });

  it('should error on unknown variant', () => {
    expect(() =>
      transpile(`
        @use '../../tokens/token-utils';

        $theme: token-utils.extend-theme($theme, ((mdc, checkbox), (mat, checkbox)), (
          accent: (
            selected-checkmark-color: magenta
          )
        ));

        html {
          @include mat.checkbox-theme($theme);
        }
      `),
    ).toThrowError(
      /Error extending theme: Unrecognized color variant `accent`. Allowed variants are: primary, secondary, tertiary, error, surface/,
    );
  });

  it('should error on unknown token', () => {
    expect(() =>
      transpile(`
        @use '../../tokens/token-utils';

        $theme: token-utils.extend-theme($theme, ((mdc, checkbox), (mat, checkbox)), (
          fake-token: red
        ));

        html {
          @include mat.checkbox-theme($theme);
        }
      `),
    ).toThrowError(/Error extending theme: Unrecognized token `fake-token`. Allowed tokens are: /);
  });
});
