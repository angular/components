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

interface M2ThemeConfig {
  type: string;
  density: string;
  typography: string;
  primary: string;
  accent: string;
  warn: string;
}

interface M3ThemeConfig {
  type: string;
  density: string;
  brand: string;
  plain: string;
  bold: string;
  medium: string;
  regular: string;
  primary: string;
  secondary: string;
  tertiary: string;
}

function defineM2Theme(config: Partial<M2ThemeConfig> = {}) {
  const {type, density, typography, primary, accent, warn} = {
    type: 'light',
    density: '0',
    typography: 'mat.define-typography-config()',
    primary: 'mat.define-palette(mat.$blue-palette)',
    accent: 'mat.define-palette(mat.$green-palette)',
    warn: 'mat.define-palette(mat.$red-palette)',
    ...config,
  };
  const collapseColor = primary === 'null' && accent === 'null' && warn === 'null';
  return `mat.define-${type}-theme((
    color: ${
      collapseColor
        ? `(
      primary: ${primary},
      accent: ${accent},
      warn: ${warn},
    )`
        : 'null'
    },
    typography: ${typography},
    density: ${density},
  ))`;
}

function defineM3Theme(config: Partial<M3ThemeConfig> = {}) {
  const {type, density, brand, plain, bold, medium, regular, primary, secondary, tertiary} = {
    type: 'light',
    density: '0',
    brand: 'Google Sans',
    plain: 'Roboto',
    bold: '700',
    medium: '500',
    regular: '400',
    primary: 'matx.$m3-blue-palette',
    secondary: 'matx.$m3-green-palette',
    tertiary: 'matx.$m3-yellow-palette',
    ...config,
  };
  return `matx.define-theme((
    color: (
      theme-type: ${type},
      primary: ${primary},
      secondary: ${secondary},
      tertiary: ${tertiary},
    ),
    typography: (
      brand-family: ${brand},
      plain-family: ${plain},
      bold-weight: ${bold},
      medium-weight: ${medium},
      regular-weight: ${regular},
    ),
    density: (
      scale: ${density}
    ),
  ))`;
}

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
          $theme: ${defineM2Theme()};
          div {
            content: mat.private-get-theme-version($theme);
          }
        `),
      ).toMatch(/content: 0;/);
    });
  });

  describe('for m3 theme', () => {
    it('should get theme version', () => {
      expect(
        transpile(`
        $theme: ${defineM3Theme()};
          div {
            content: mat.private-get-theme-version($theme);
          }
        `),
      ).toMatch(/content: 1;/);
    });

    it('should get theme type', () => {
      expect(
        transpile(`
          $theme: ${defineM3Theme()};
          div {
            content: mat.private-get-theme-type($theme);
          }
        `),
      ).toMatch(/content: light;/);
    });

    it('should get role color', () => {
      expect(
        transpile(`
          $theme: ${defineM3Theme()};
          div {
            content: mat.private-get-theme-color($theme, primary-container);
          }
        `),
      ).toMatch(/content: #e0e0ff;/);
    });

    it('should error on invalid color role', () => {
      expect(() =>
        transpile(`
          $theme: ${defineM3Theme()};
          div {
            content: mat.private-get-theme-color($theme, fake-role);
          }
        `),
      ).toThrowError(/Valid color roles are.*Got: fake-role/);
    });

    it('should get palette color', () => {
      expect(
        transpile(`
          $theme: ${defineM3Theme()};
          div {
            content: mat.private-get-theme-color($theme, tertiary, 20);
          }
        `),
      ).toMatch(/content: #323200;/);
    });

    it('should error on invalid color palette', () => {
      expect(() =>
        transpile(`
          $theme: ${defineM3Theme()};
          div {
            content: mat.private-get-theme-color($theme, fake-palette, 20);
          }
        `),
      ).toThrowError(/Valid palettes are.*Got: fake-palette/);
    });

    it('should error on invalid color hue', () => {
      expect(() =>
        transpile(`
          $theme: ${defineM3Theme()};
          div {
            content: mat.private-get-theme-color($theme, neutral, 11);
          }
        `),
      ).toThrowError(/Valid hues for neutral are.*Got: 11/);
    });

    it('should error on wrong number of get-color-theme args', () => {
      expect(() =>
        transpile(`
          $theme: ${defineM3Theme()};
          div {
            content: mat.private-get-theme-color($theme);
          }
        `),
      ).toThrowError(/Expected 2 or 3 arguments. Got: 1/);
    });
  });
});
