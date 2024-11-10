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
        @use 'sass:map';
        @use '../../../index' as mat;

        ${content}
      `,
    {
      loadPaths: [testDir],
      importers: [localPackageSassImporter],
    },
  ).css.toString();
}

describe('theming inspection api', () => {
  describe('for m2 theme', () => {
    it('should get theme version', () => {
      expect(
        transpile(`
          $theme: mat.m2-define-light-theme((
            color: (
              primary: mat.m2-define-palette(mat.$m2-red-palette),
              accent: mat.m2-define-palette(mat.$m2-red-palette),
              warn: mat.m2-define-palette(mat.$m2-red-palette),
            ),
            typography: mat.m2-define-typography-config(),
            density: 0,
          ));
          div {
            --theme-version: #{mat.get-theme-version($theme)};
          }
        `),
      ).toMatch('--theme-version: 0;');
    });

    it('should get theme type', () => {
      expect(
        transpile(`
          $theme: mat.m2-define-dark-theme((
            color: (
              primary: mat.m2-define-palette(mat.$m2-red-palette),
              accent: mat.m2-define-palette(mat.$m2-red-palette),
            ),
          ));
          div {
            --theme-type: #{mat.get-theme-type($theme)};
          }
        `),
      ).toMatch('--theme-type: dark;');
    });

    it('should get role color', () => {
      expect(
        transpile(`
          $theme: mat.m2-define-light-theme((
            color: (
              primary: mat.m2-define-palette(mat.$m2-red-palette),
              accent: mat.m2-define-palette(mat.$m2-green-palette)
            )
          ));
          div {
            color: mat.get-theme-color($theme, accent);
          }
        `),
      ).toMatch('color: #4caf50;');
    });

    it('should get palette color', () => {
      expect(
        transpile(`
          $theme: mat.m2-define-light-theme((
            color: (
              primary: mat.m2-define-palette(mat.$m2-red-palette),
              accent: mat.m2-define-palette(mat.$m2-green-palette)
            )
          ));
          div {
            color: mat.get-theme-color($theme, accent, A200);
          }
        `),
      ).toMatch('color: #69f0ae;');
    });

    it('should get typography properties from theme', () => {
      const css = transpile(`
        $theme: mat.m2-define-light-theme((
          typography: mat.m2-define-typography-config()
        ));
        div {
          font: mat.get-theme-typography($theme, headline-1);
          font-family: mat.get-theme-typography($theme, headline-1, font-family);
          font-size: mat.get-theme-typography($theme, headline-1, font-size);
          font-weight: mat.get-theme-typography($theme, headline-1, font-weight);
          line-height: mat.get-theme-typography($theme, headline-1, line-height);
          letter-spacing: mat.get-theme-typography($theme, headline-1, letter-spacing);
        }
      `);
      expect(css).toMatch('font: 300 96px / 96px Roboto, sans-serif;');
      expect(css).toMatch('font-family: Roboto, sans-serif;');
      expect(css).toMatch('font-size: 96px;');
      expect(css).toMatch('font-weight: 300;');
      expect(css).toMatch('line-height: 96px;');
      expect(css).toMatch('letter-spacing: -0.015625em;');
    });

    it('should get density scale', () => {
      expect(
        transpile(`
          $theme: mat.m2-define-light-theme((
            density: -1
          ));
          div {
            --density-scale: #{mat.get-theme-density($theme)};
          }
        `),
      ).toMatch('--density-scale: -1;');
    });

    it('should check what information the theme has', () => {
      const css = transpile(`
        $theme: mat.m2-define-light-theme((
          color: (
            primary: mat.m2-define-palette(mat.$m2-red-palette),
            accent: mat.m2-define-palette(mat.$m2-red-palette),
          ),
          typography: mat.m2-define-typography-config(),
          density: -1,
        ));
        $color-only: mat.m2-define-light-theme((
          color: (
            primary: mat.m2-define-palette(mat.$m2-red-palette),
            accent: mat.m2-define-palette(mat.$m2-red-palette),
          ),
          typography: null,
          density: null,
        ));
        $typography-only: mat.m2-define-light-theme((
          color: null,
          typography: mat.m2-define-typography-config(),
          density: null,
        ));
        $density-only: mat.m2-define-light-theme((
          color: null,
          typography: null,
          density: -1,
        ));
        div {
          --base: #{(
            mat.theme-has($theme, base),
            mat.theme-has($color-only, base),
            mat.theme-has($typography-only, base),
            mat.theme-has($density-only, base),
          )};
          --color: #{(
            mat.theme-has($theme, color),
            mat.theme-has($color-only, color),
            mat.theme-has($typography-only, color),
            mat.theme-has($density-only, color),
          )};
          --typography: #{(
            mat.theme-has($theme, typography),
            mat.theme-has($color-only, typography),
            mat.theme-has($typography-only, typography),
            mat.theme-has($density-only, typography),
          )};
          --density: #{(
            mat.theme-has($theme, density),
            mat.theme-has($color-only, density),
            mat.theme-has($typography-only, density),
            mat.theme-has($density-only, density),
          )};
        }
      `);
      expect(css).toMatch(/--base: true, true, true, true;/);
      expect(css).toMatch(/--color: true, true, false, false;/);
      expect(css).toMatch(/--typography: true, false, true, false;/);
      expect(css).toMatch(/--density: true, false, false, true;/);
    });

    it('should work with compatibility disabled', () => {
      expect(
        transpile(`
          mat.$theme-legacy-inspection-api-compatibility: false;
          $theme: mat.m2-define-dark-theme((
            color: (
              primary: mat.m2-define-palette(mat.$m2-red-palette),
              accent: mat.m2-define-palette(mat.$m2-red-palette),
            )
          ));
          div {
            --theme-type: #{mat.get-theme-type($theme)};
          }
        `),
      ).toMatch('--theme-type: dark;');
    });

    it('should not allow access via legacy APIs with compatibility disabled', () => {
      expect(() =>
        transpile(`
          mat.$theme-legacy-inspection-api-compatibility: false;
          $theme: mat.m2-define-dark-theme((
            color: (
              primary: mat.m2-define-palette(mat.$red-palette),
              accent: mat.m2-define-palette(mat.$red-palette),
            )
          ));
          $color-config: mat.get-color-config($theme);
          $primary: map.get($color-config, primary);
          div {
            color: #{mat.m2-get-color-from-palette($primary)};
          }
        `),
      ).toThrow();
    });
  });

  describe('for m3 theme', () => {
    it('should get theme version', () => {
      expect(
        transpile(`
          $theme: mat.define-theme();
          div {
            --theme-version: #{mat.get-theme-version($theme)};
          }
        `),
      ).toMatch('--theme-version: 1;');
    });

    it('should get theme type', () => {
      expect(
        transpile(`
          $theme: mat.define-theme();
          div {
            --theme-type: #{mat.get-theme-type($theme)};
          }
        `),
      ).toMatch('--theme-type: light;');
    });

    it('should get role color', () => {
      expect(
        transpile(`
          $theme: mat.define-theme();
          div {
            color: mat.get-theme-color($theme, primary-container);
          }
        `),
      ).toMatch('color: #ecdcff;');
    });

    it('should error on invalid color role', () => {
      expect(() =>
        transpile(`
          $theme: mat.define-theme();
          div {
            color: mat.get-theme-color($theme, fake-role);
          }
        `),
      ).toThrowError(/Valid color roles are.*Got: fake-role/);
    });

    it('should get palette color', () => {
      expect(
        transpile(`
          $theme: mat.define-theme();
          div {
            color: mat.get-theme-color($theme, tertiary, 20);
          }
        `),
      ).toMatch('color: #42008a;');
    });

    it('should error on invalid color palette', () => {
      expect(() =>
        transpile(`
          $theme: mat.define-theme();
          div {
            color: mat.get-theme-color($theme, fake-palette, 20);
          }
        `),
      ).toThrowError(/Valid palettes are.*Got: fake-palette/);
    });

    it('should error on invalid color hue', () => {
      expect(() =>
        transpile(`
          $theme: mat.define-theme();
          div {
            color: mat.get-theme-color($theme, neutral, 11);
          }
        `),
      ).toThrowError(/Valid hues for neutral are.*Got: 11/);
    });

    it('should error on wrong number of get-color-theme args', () => {
      expect(() =>
        transpile(`
          $theme: mat.define-theme();
          div {
            color: mat.get-theme-color($theme);
          }
        `),
      ).toThrowError(/Expected either 2 or 3 arguments when working with an M3 theme\. Got: 1/);
    });

    it('should get typography properties from theme', () => {
      const css = transpile(`
        $theme: mat.define-theme();
        div {
          font: mat.get-theme-typography($theme, headline-large);
          font-family: mat.get-theme-typography($theme, headline-large, font-family);
          font-size: mat.get-theme-typography($theme, headline-large, font-size);
          font-weight: mat.get-theme-typography($theme, headline-large, font-weight);
          line-height: mat.get-theme-typography($theme, headline-large, line-height);
          letter-spacing: mat.get-theme-typography($theme, headline-large, letter-spacing);
        }
      `);
      expect(css).toMatch('font: 400 2rem / 2.5rem Roboto, sans-serif;');
      expect(css).toMatch('font-family: Roboto, sans-serif;');
      expect(css).toMatch('font-size: 2rem;');
      expect(css).toMatch('font-weight: 400;');
      expect(css).toMatch('line-height: 2.5rem;');
      expect(css).toMatch('letter-spacing: 0;');
    });

    it('should error on invalid typescale', () => {
      expect(() =>
        transpile(`
          $theme: mat.define-theme();
          div {
            font: mat.get-theme-typography($theme, subtitle-large);
          }
        `),
      ).toThrowError(/Valid typescales are:.*Got: subtitle-large/);
    });

    it('should error on invalid typography property', () => {
      expect(() =>
        transpile(`
          $theme: mat.define-theme();
          div {
            text-transform: mat.get-theme-typography($theme, body-small, text-transform);
          }
        `),
      ).toThrowError(/Valid typography properties are:.*Got: text-transform/);
    });

    it('should get density scale', () => {
      expect(
        transpile(`
          $theme: mat.define-theme();
          div {
            --density-scale: #{mat.get-theme-density($theme)};
          }
        `),
      ).toMatch('--density-scale: 0;');
    });

    it('should check what information the theme has', () => {
      const css = transpile(`
        $theme: mat.define-theme();
        $color-only: mat.define-colors();
        $typography-only: mat.define-typography();
        $density-only: mat.define-density();
        div {
          --base: #{(
            mat.theme-has($theme, base),
            mat.theme-has($color-only, base),
            mat.theme-has($typography-only, base),
            mat.theme-has($density-only, base),
          )};
          --color: #{(
            mat.theme-has($theme, color),
            mat.theme-has($color-only, color),
            mat.theme-has($typography-only, color),
            mat.theme-has($density-only, color),
          )};
          --typography: #{(
            mat.theme-has($theme, typography),
            mat.theme-has($color-only, typography),
            mat.theme-has($typography-only, typography),
            mat.theme-has($density-only, typography),
          )};
          --density: #{(
            mat.theme-has($theme, density),
            mat.theme-has($color-only, density),
            mat.theme-has($typography-only, density),
            mat.theme-has($density-only, density),
          )};
        }
      `);
      expect(css).toMatch(/--base: true, false, false, false;/);
      expect(css).toMatch(/--color: true, true, false, false;/);
      expect(css).toMatch(/--typography: true, false, true, false;/);
      expect(css).toMatch(/--density: true, false, false, true;/);
    });

    it('should error when reading theme type from a theme with no color information', () => {
      expect(() =>
        transpile(`
        $theme: mat.define-density();
        div {
          color: mat.get-theme-type($theme);
        }
      `),
      ).toThrowError(/Color information is not available on this theme/);
    });

    it('should error when reading color from a theme with no color information', () => {
      expect(() =>
        transpile(`
        $theme: mat.define-density();
        div {
          color: mat.get-theme-color($theme, primary);
        }
      `),
      ).toThrowError(/Color information is not available on this theme/);
    });

    it('should error when reading typography from a theme with no typography information', () => {
      expect(() =>
        transpile(`
          $theme: mat.define-density();
          div {
            font: mat.get-theme-typography($theme, body-small);
          }
        `),
      ).toThrowError(/Typography information is not available on this theme/);
    });

    it('should error when reading density from a theme with no density information', () => {
      expect(() =>
        transpile(`
          $theme: mat.define-colors();
          div {
            --density: #{mat.get-theme-density($theme)};
          }
        `),
      ).toThrowError(/Density information is not available on this theme/);
    });

    it('should not emit styles for removed theme dimensions', () => {
      const css = transpile(`
        $theme: mat.theme-remove(mat.define-theme(), base, color, typography, density);
        div {
          @include mat.all-component-themes($theme);
        }`);
      expect(css.trim()).toBe('');
    });
  });
});
