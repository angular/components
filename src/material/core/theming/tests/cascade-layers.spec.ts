import {runfiles} from '@bazel/runfiles';
import * as fs from 'fs';
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
  it('wraps mat.theme with mat.theme-layer', () => {
    const css = transpile(`
      @include mat.theme-layer {
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
      }
    `);
    expect(css).toContain('@layer angular-material');
  });

  it('does not emit @layer when theme-layer is omitted', () => {
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
    expect(css).not.toContain('@layer angular-material');
  });

  it('wraps compiled component CSS in the angular-material layer', () => {
    const css = fs.readFileSync(
      runfiles.resolveWorkspaceRelative('src/material/button/button.css'),
      'utf8',
    );
    expect(css).toMatch(/^@layer angular-material \{/);
    expect(css).toContain('.mat-mdc-button-base');
  });

  it('wraps prebuilt theme CSS in the angular-material layer', () => {
    const css = fs.readFileSync(
      runfiles.resolveWorkspaceRelative('src/material/prebuilt-themes/azure-blue.css'),
      'utf8',
    );
    expect(css).toMatch(/^@layer angular-material \{/);
  });
});
