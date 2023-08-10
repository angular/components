import {compileString} from 'sass';
import {runfiles} from '@bazel/runfiles';
import * as path from 'path';

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

/** Transpiles given Sass content into CSS. */
function transpile(content: string) {
  return compileString(
    `
        @use '../../../index' as mat;
        @use '../../../../material-experimental/index' as matx;

        ${content}
      `,
    {
      loadPaths: [testDir],
      importers: [localPackageSassImporter, mdcSassImporter],
    },
  ).css.toString();
}

describe('theming inspection api', () => {
  describe('for m2 theme', () => {
    it('should get theme version', () => {
      expect(
        transpile(`
          $theme: mat.define-light-theme((
            color: (
              primary: mat.define-palette(mat.$red-palette),
              accent: mat.define-palette(mat.$red-palette),
              warn: mat.define-palette(mat.$red-palette),
            ),
            typography: mat.define-typography-config(),
            density: 0,
          ));
          div {
            --theme-version: #{mat.private-get-theme-version($theme)};
          }
        `),
      ).toMatch('--theme-version: 0;');
    });
  });

  describe('for m3 theme', () => {
    it('should get theme version', () => {
      expect(
        transpile(`
          $theme: matx.define-theme();
          div {
            --theme-version: #{mat.private-get-theme-version($theme)};
          }
        `),
      ).toMatch('--theme-version: 1;');
    });

    it('should get theme type', () => {
      expect(
        transpile(`
          $theme: matx.define-theme();
          div {
            --theme-type: #{mat.private-get-theme-type($theme)};
          }
        `),
      ).toMatch('--theme-type: light;');
    });

    it('should get role color', () => {
      expect(
        transpile(`
          $theme: matx.define-theme();
          div {
            color: mat.private-get-theme-color($theme, primary-container);
          }
        `),
      ).toMatch('color: #f0dbff;');
    });

    it('should error on invalid color role', () => {
      expect(() =>
        transpile(`
          $theme: matx.define-theme();
          div {
            color: mat.private-get-theme-color($theme, fake-role);
          }
        `),
      ).toThrowError(/Valid color roles are.*Got: fake-role/);
    });

    it('should get palette color', () => {
      expect(
        transpile(`
          $theme: matx.define-theme();
          div {
            color: mat.private-get-theme-color($theme, tertiary, 20);
          }
        `),
      ).toMatch('color: #4a0080;');
    });

    it('should error on invalid color palette', () => {
      expect(() =>
        transpile(`
          $theme: matx.define-theme();
          div {
            color: mat.private-get-theme-color($theme, fake-palette, 20);
          }
        `),
      ).toThrowError(/Valid palettes are.*Got: fake-palette/);
    });

    it('should error on invalid color hue', () => {
      expect(() =>
        transpile(`
          $theme: matx.define-theme();
          div {
            color: mat.private-get-theme-color($theme, neutral, 11);
          }
        `),
      ).toThrowError(/Valid hues for neutral are.*Got: 11/);
    });

    it('should error on wrong number of get-color-theme args', () => {
      expect(() =>
        transpile(`
          $theme: matx.define-theme();
          div {
            color: mat.private-get-theme-color($theme);
          }
        `),
      ).toThrowError(/Expected 2 or 3 arguments. Got: 1/);
    });

    it('should get typography properties from theme', () => {
      const css = transpile(`
        $theme: matx.define-theme();
        div {
          font: mat.private-get-theme-typography($theme, headline-large);
          font-family: mat.private-get-theme-typography($theme, headline-large, font-family);
          font-size: mat.private-get-theme-typography($theme, headline-large, font-size);
          font-weight: mat.private-get-theme-typography($theme, headline-large, font-weight);
          line-height: mat.private-get-theme-typography($theme, headline-large, line-height);
          letter-spacing: mat.private-get-theme-typography($theme, headline-large, letter-spacing);
        }
      `);
      expect(css).toMatch('font: 400 2rem / 2.5rem Roboto, sans-serif;');
      expect(css).toMatch('font-family: Roboto, sans-serif;');
      expect(css).toMatch('font-size: 2rem;');
      expect(css).toMatch('font-weight: 400;');
      expect(css).toMatch('line-height: 2.5rem;');
      expect(css).toMatch('letter-spacing: 0rem;');
    });
  });

  it('should error on invalid typescale', () => {
    expect(() =>
      transpile(`
        $theme: matx.define-theme();
        div {
          font: mat.private-get-theme-typography($theme, subtitle-large);
        }
      `),
    ).toThrowError(/Valid typescales are:.*Got: subtitle-large/);
  });

  it('should error on invalid typography property', () => {
    expect(() =>
      transpile(`
        $theme: matx.define-theme();
        div {
          text-transform: mat.private-get-theme-typography($theme, body-small, text-transform);
        }
      `),
    ).toThrowError(/Valid typography properties are:.*Got: text-transform/);
  });

  it('should get density scale', () => {
    expect(
      transpile(`
        $theme: matx.define-theme();
        div {
          --density-scale: #{mat.private-get-theme-density($theme)};
        }
      `),
    ).toMatch('--density-scale: 0;');
  });

  it('should check what information the theme has', () => {
    const css = transpile(`
      $theme: matx.define-theme();
      $color-only: matx.define-colors();
      $typography-only: matx.define-typography();
      $density-only: matx.define-density();
      div {
        --base: #{(
          mat.private-theme-has($theme, base),
          mat.private-theme-has($color-only, base),
          mat.private-theme-has($typography-only, base),
          mat.private-theme-has($density-only, base),
        )};
        --color: #{(
          mat.private-theme-has($theme, color),
          mat.private-theme-has($color-only, color),
          mat.private-theme-has($typography-only, color),
          mat.private-theme-has($density-only, color),
        )};
        --typography: #{(
          mat.private-theme-has($theme, typography),
          mat.private-theme-has($color-only, typography),
          mat.private-theme-has($typography-only, typography),
          mat.private-theme-has($density-only, typography),
        )};
        --density: #{(
          mat.private-theme-has($theme, density),
          mat.private-theme-has($color-only, density),
          mat.private-theme-has($typography-only, density),
          mat.private-theme-has($density-only, density),
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
        $theme: matx.define-density();
        div {
          color: mat.private-get-theme-type($theme);
        }
      `),
    ).toThrowError(/Color information is not available on this theme/);
  });

  it('should error when reading color from a theme with no color information', () => {
    expect(() =>
      transpile(`
        $theme: matx.define-density();
        div {
          color: mat.private-get-theme-color($theme, primary);
        }
      `),
    ).toThrowError(/Color information is not available on this theme/);
  });

  it('should error when reading typography from a theme with no typography information', () => {
    expect(() =>
      transpile(`
        $theme: matx.define-density();
        div {
          font: mat.private-get-theme-typography($theme, body-small);
        }
      `),
    ).toThrowError(/Typography information is not available on this theme/);
  });

  it('should error when reading density from a theme with no density information', () => {
    expect(() =>
      transpile(`
        $theme: matx.define-colors();
        div {
          --density: #{mat.private-get-theme-density($theme)};
        }
      `),
    ).toThrowError(/Density information is not available on this theme/);
  });
});
