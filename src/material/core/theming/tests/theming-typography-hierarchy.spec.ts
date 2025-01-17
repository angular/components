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

function verifyFullSelector(css: string, selector: string) {
  expect(css).toMatch(
    new RegExp(String.raw`(^|\n)` + selector.replace(/\./g, String.raw`\.`) + String.raw` \{`),
  );
}

describe('typography hierarchy', () => {
  describe('for M3', () => {
    it('should emit styles for h1', () => {
      const css = transpile('@include mat.typography-hierarchy($theme)');
      verifyFullSelector(
        css,
        '.mat-display-large, .mat-typography .mat-display-large, .mat-typography h1',
      );
    });

    it('should emit default body styles', () => {
      const css = transpile('@include mat.typography-hierarchy($theme)');
      verifyFullSelector(css, '.mat-body-large, .mat-typography .mat-body-large, .mat-typography');
    });

    it('should emit default body paragraph styles', () => {
      const css = transpile('@include mat.typography-hierarchy($theme)');
      verifyFullSelector(
        css,
        '.mat-body-large p, .mat-typography .mat-body-large p, .mat-typography p',
      );
    });

    it('should emit m2 selectors when requested', () => {
      const css = transpile('@include mat.typography-hierarchy($theme, $back-compat: true)');
      verifyFullSelector(
        css,
        '.mat-display-large, .mat-typography .mat-display-large, .mat-typography h1, .mat-h1, .mat-typography .mat-h1, .mat-headline-1, .mat-typography .mat-headline-1',
      );
    });

    it('should use custom selector prefix', () => {
      const css = transpile(`@include mat.typography-hierarchy($theme, $selector: '.special')`);
      verifyFullSelector(css, '.mat-display-large, .special .mat-display-large, .special h1');
    });
  });
});
