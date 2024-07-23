import {parse, Rule} from 'postcss';
import {compileString} from 'sass';
import {runfiles} from '@bazel/runfiles';
import * as path from 'path';

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
});
