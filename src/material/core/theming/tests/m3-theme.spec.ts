import {runfiles} from '@bazel/runfiles';
import * as path from 'path';
import {parse, Rule} from 'postcss';
import {compileString} from 'sass';

import {pathToFileURL} from 'url';
import {createLocalAngularPackageImporter} from '../../../../../tools/sass/local-sass-importer';

// Note: For Windows compatibility, we need to resolve the directory paths through runfiles
// which are guaranteed to reside in the source tree.
const testDir = path.join(runfiles.resolvePackageRelative('../_all-theme.scss'), '../tests');
const packagesDir = path.join(runfiles.resolveWorkspaceRelative('src/cdk/_index.scss'), '../..');

const localPackageSassImporter = createLocalAngularPackageImporter(packagesDir);

const mdcSassImporter = {
  findFileUrl: (url: string) => {
    if (url.toString().startsWith('@material')) {
      return pathToFileURL(
        path.join(runfiles.resolveWorkspaceRelative('./node_modules'), url),
      ) as URL;
    }
    return null;
  },
};

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
      importers: [localPackageSassImporter, mdcSassImporter],
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
    const selectors: string[] = [];
    root.walkRules(rule => {
      selectors.push(rule.selector);
    });
    expect(selectors).toEqual(['html', '.mat-theme-loaded-marker']);
  });

  it('should only emit CSS variables', () => {
    const root = parse(transpile(`html { @include mat.all-component-themes($theme); }`));
    const nonVarProps: string[] = [];
    root.walkDecls(decl => {
      if (
        !decl.prop.startsWith('--') &&
        // Skip the theme loaded marker since it can't be a variable.
        (decl.parent as Rule).selector !== '.mat-theme-loaded-marker'
      ) {
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
        /Error extending theme: Theme does not have tokens for namespace `\(mat, checkbocks\)`/,
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
      ).toThrowError(
        /Error extending theme: Unrecognized token `fake-token`. Allowed tokens are: /,
      );
    });

    it('should allow accessing a namespace with a prefix', () => {
      const css = transpile(`
        @use '../../tokens/token-utils';

        $theme: token-utils.extend-theme($theme,
          (
            (namespace: (mat, minimal-pseudo-checkbox), prefix: 'minimal-'),
            (mat, full-pseudo-checkbox)
          ),
          (
            minimal-selected-checkmark-color: magenta,
            selected-checkmark-color: cyan
          )
        );

        html {
          @include mat.pseudo-checkbox-theme($theme);
        }
      `);

      expect(css).toContain('--mat-minimal-pseudo-checkbox-selected-checkmark-color: magenta');
      expect(css).toContain('--mat-full-pseudo-checkbox-selected-checkmark-color: cyan');
    });

    it('should not allow accessing a prefixed namespace without its prefix', () => {
      expect(() =>
        transpile(`
        @use '../../tokens/token-utils';

        $theme: token-utils.extend-theme($theme,
          (
            (namespace: (mat, minimal-pseudo-checkbox), prefix: 'minimal-'),
          ),
          (
            selected-checkmark-color: magenta
          )
        );

        html {
          @include mat.pseudo-checkbox-theme($theme);
        }
        `),
      ).toThrowError(
        /Error extending theme: Unrecognized token `selected-checkmark-color`. Allowed tokens are:.* minimal-selected-checkmark-color/,
      );
    });

    it('should detect name collisions that remain after prefixes are applied', () => {
      expect(() =>
        transpile(`
        @use '../../tokens/token-utils';

        $theme: token-utils.extend-theme($theme,
          (
            (namespace: (mat, minimal-pseudo-checkbox), prefix: 'both-'),
            (namespace: (mat, full-pseudo-checkbox), prefix: 'both-')
          ),
          (
            both-selected-checkmark-color: magenta
          )
        );

        html {
          @include mat.pseudo-checkbox-theme($theme);
        }
        `),
      ).toThrowError(
        /Error extending theme: Ambiguous token name `both-selected-checkmark-color` exists in multiple namespaces/,
      );
    });

    it('should not error when calling component extend-theme functions', () => {
      // Ensures that no components have issues with ambiguous token names, by triggering the
      // validation logic for each extend-theme function.
      expect(() =>
        transpile(`
          $theme: mat.core-extend-theme($theme, ());
          $theme: mat.ripple-extend-theme($theme, ());
          $theme: mat.option-extend-theme($theme, ());
          $theme: mat.optgroup-extend-theme($theme, ());
          $theme: mat.pseudo-checkbox-extend-theme($theme, ());
          $theme: mat.autocomplete-extend-theme($theme, ());
          $theme: mat.badge-extend-theme($theme, ());
          $theme: mat.bottom-sheet-extend-theme($theme, ());
          $theme: mat.button-extend-theme($theme, ());
          $theme: mat.fab-extend-theme($theme, ());
          $theme: mat.icon-button-extend-theme($theme, ());
          $theme: mat.button-toggle-extend-theme($theme, ());
          $theme: mat.card-extend-theme($theme, ());
          $theme: mat.checkbox-extend-theme($theme, ());
          $theme: mat.chips-extend-theme($theme, ());
          $theme: mat.datepicker-extend-theme($theme, ());
          $theme: mat.dialog-extend-theme($theme, ());
          $theme: mat.divider-extend-theme($theme, ());
          $theme: mat.expansion-extend-theme($theme, ());
          $theme: mat.form-field-extend-theme($theme, ());
          $theme: mat.grid-list-extend-theme($theme, ());
          $theme: mat.icon-extend-theme($theme, ());
          $theme: mat.list-extend-theme($theme, ());
          $theme: mat.menu-extend-theme($theme, ());
          $theme: mat.paginator-extend-theme($theme, ());
          $theme: mat.progress-bar-extend-theme($theme, ());
          $theme: mat.progress-spinner-extend-theme($theme, ());
          $theme: mat.radio-extend-theme($theme, ());
          $theme: mat.select-extend-theme($theme, ());
          $theme: mat.sidenav-extend-theme($theme, ());
          $theme: mat.slide-toggle-extend-theme($theme, ());
          $theme: mat.slider-extend-theme($theme, ());
          $theme: mat.snack-bar-extend-theme($theme, ());
          $theme: mat.sort-extend-theme($theme, ());
          $theme: mat.stepper-extend-theme($theme, ());
          $theme: mat.table-extend-theme($theme, ());
          $theme: mat.tabs-extend-theme($theme, ());
          $theme: mat.toolbar-extend-theme($theme, ());
          $theme: mat.tooltip-extend-theme($theme, ());
          $theme: mat.tree-extend-theme($theme, ());

          html {
            @include mat.all-component-themes($theme);
          }
        `),
      ).not.toThrow();
    });
  });

  describe('token override API', () => {
    it('should emit override', () => {
      const css = transpile(`
        @use '../../tokens/token-utils';
        @use '../../tokens/m2/mdc/checkbox' as tokens-mdc-checkbox;

        @include token-utils.override-tokens(
          (
            selected-checkmark-color: magenta
          ),
          (
            namespace: tokens-mdc-checkbox.$prefix,
            tokens: tokens-mdc-checkbox.get-token-slots()
          )
        );
      `);

      expect(css).toContain('--mdc-checkbox-selected-checkmark-color: magenta');
    });

    it('should error on ambiguous shorthand token name', () => {
      expect(() =>
        transpile(`
          @use '../../tokens/token-utils';
          @use '../../tokens/m2/mat/full-pseudo-checkbox' as tokens-full-pcb;
          @use '../../tokens/m2/mat/minimal-pseudo-checkbox' as tokens-minimal-pcb;

          @include token-utils.override-tokens(
            (
              selected-checkmark-color: magenta
            ),
            (
              namespace: tokens-full-pcb.$prefix,
              tokens: tokens-full-pcb.get-token-slots()
            ),
            (
              namespace: tokens-minimal-pcb.$prefix,
              tokens: tokens-minimal-pcb.get-token-slots()
            )
          );
        `),
      ).toThrowError(
        /Error overriding token: Ambiguous token name `selected-checkmark-color` exists in multiple namespaces: `\(mat, full-pseudo-checkbox\)` and `\(mat, minimal-pseudo-checkbox\)`/,
      );
    });

    it('should error on unknown token', () => {
      expect(() =>
        transpile(`
          @use '../../tokens/token-utils';
          @use '../../tokens/m2/mdc/checkbox' as tokens-mdc-checkbox;

          @include token-utils.override-tokens(
            (
              fake-token: magenta
            ),
            (
              namespace: tokens-mdc-checkbox.$prefix,
              tokens: tokens-mdc-checkbox.get-token-slots()
            )
          );
        `),
      ).toThrowError(
        /Error overriding token: Unrecognized token `fake-token`. Allowed tokens are:/,
      );
    });

    it('should allow accessing a namespace with a prefix', () => {
      const css = transpile(`
        @use '../../tokens/token-utils';
        @use '../../tokens/m2/mat/full-pseudo-checkbox' as tokens-full-pcb;
        @use '../../tokens/m2/mat/minimal-pseudo-checkbox' as tokens-minimal-pcb;

        @include token-utils.override-tokens(
          (
            full-selected-checkmark-color: magenta,
            minimal-selected-checkmark-color: cyan
          ),
          (
            namespace: tokens-full-pcb.$prefix,
            tokens: tokens-full-pcb.get-token-slots(),
            prefix: 'full-'
          ),
          (
            namespace: tokens-minimal-pcb.$prefix,
            tokens: tokens-minimal-pcb.get-token-slots(),
            prefix: 'minimal-'
          )
        );
      `);

      expect(css).toContain('--mat-full-pseudo-checkbox-selected-checkmark-color: magenta');
      expect(css).toContain('--mat-minimal-pseudo-checkbox-selected-checkmark-color: cyan');
    });

    it('should not allow accessing a prefixed namespace without its prefix', () => {
      expect(() =>
        transpile(`
          @use '../../tokens/token-utils';
          @use '../../tokens/m2/mat/minimal-pseudo-checkbox' as tokens-minimal-pcb;

          @include token-utils.override-tokens(
            (
              selected-checkmark-color: magenta
            ),
            (
              namespace: tokens-minimal-pcb.$prefix,
              tokens: tokens-minimal-pcb.get-token-slots(),
              prefix: 'minimal-'
            )
          );
        `),
      ).toThrowError(
        /Error overriding token: Unrecognized token `selected-checkmark-color`. Allowed tokens are:.* minimal-selected-checkmark-color/,
      );
    });

    it('should detect name collisions that remain after prefixes are applied', () => {
      expect(() =>
        transpile(`
          @use '../../tokens/token-utils';
          @use '../../tokens/m2/mat/full-pseudo-checkbox' as tokens-full-pcb;
          @use '../../tokens/m2/mat/minimal-pseudo-checkbox' as tokens-minimal-pcb;

          @include token-utils.override-tokens(
            (
              both-selected-checkmark-color: magenta,
            ),
            (
              namespace: tokens-full-pcb.$prefix,
              tokens: tokens-full-pcb.get-token-slots(),
              prefix: 'both-'
            ),
            (
              namespace: tokens-minimal-pcb.$prefix,
              tokens: tokens-minimal-pcb.get-token-slots(),
              prefix: 'both-'
            )
          );
        `),
      ).toThrowError(
        /Error overriding token: Ambiguous token name `both-selected-checkmark-color` exists in multiple namespaces/,
      );
    });

    it('should not error when calling component extend-theme functions', () => {
      // Ensures that no components have issues with ambiguous token names, by triggering the
      // validation logic for each override mixin.
      expect(() =>
        transpile(`
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
        `),
      ).not.toThrow();
    });
  });
});
