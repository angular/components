import {runfiles} from '@bazel/runfiles';
import * as path from 'path';
import {compileString} from 'sass';

import {createLocalAngularPackageImporter} from '../../../../../tools/sass/local-sass-importer.js';

const testDir = path.join(runfiles.resolvePackageRelative('../_all-theme.scss'), '../tests');
const packagesDir = path.join(runfiles.resolveWorkspaceRelative('src/cdk/_index.scss'), '../..');
const localPackageSassImporter = createLocalAngularPackageImporter(packagesDir);

function transpile(content: string) {
  return compileString(
    `
        @use '../../../index' as mat;

        $theme: mat.define-theme();

        ${content}
      `,
    {
      loadPaths: [testDir],
      importers: [localPackageSassImporter],
    },
  ).css.toString();
}

describe('CSS cascade layers', () => {
  it('wraps mat.theme in @layer when third argument is set', () => {
    const css = transpile(`
      html {
        @include mat.theme(
          (
            color: (
              theme-type: light,
              primary: mat.$violet-palette,
            ),
            typography: Roboto,
            density: 0,
          ),
          (),
          mat.$default-cascade-layer-name
        );
      }
    `);
    expect(css).toContain('@layer angular-material');
  });

  it('does not emit @layer when third argument is omitted', () => {
    const css = transpile(`
      html {
        @include mat.theme((
          color: (
            theme-type: light,
            primary: mat.$violet-palette,
          ),
          typography: Roboto,
          density: 0,
        ));
      }
    `);
    expect(css).not.toContain('@layer');
  });

  it('wraps output for with-cascade-layer', () => {
    const css = transpile(`
      html {
        @include mat.with-cascade-layer(custom-layer) {
          @include mat.theme((
            color: (
              theme-type: light,
              primary: mat.$violet-palette,
            ),
            typography: Roboto,
            density: 0,
          ));
        }
      }
    `);
    expect(css).toContain('@layer custom-layer');
  });
});
