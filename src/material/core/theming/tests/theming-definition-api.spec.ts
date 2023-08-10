import {parse} from 'postcss';
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
        @use 'sass:list';
        @use 'sass:map';
        @use '../../../index' as mat;
        @use '../../../../material-experimental/index' as matx;

        $internals: _mat-theming-internals-do-not-access;

        ${content}
      `,
    {
      loadPaths: [testDir],
      importers: [localPackageSassImporter, mdcSassImporter],
    },
  ).css.toString();
}

function getRootVars(css: string) {
  const result: {[key: string]: string} = {};
  parse(css).each(node => {
    if (node.type === 'rule' && node.selector === ':root') {
      node.walk(child => {
        if (child.type === 'decl') {
          if (child.prop.startsWith('--')) {
            result[child.prop.substring(2)] = child.value;
          }
        }
      });
    }
  });
  return result;
}

describe('theming definition api', () => {
  describe('define-theme', () => {
    it('should fill in defaults', () => {
      const css = transpile(`
        $theme: matx.define-theme();
        $data: map.get($theme, $internals);
        :root {
          --keys: #{map.keys($data)};
          --version: #{map.get($data, theme-version)};
          --type: #{map.get($data, theme-type)};
          --palettes: #{map.keys(map.get($data, palettes))};
          --density: #{map.get($data, density-scale)};
          --base-tokens: #{list.length(map.get($data, base-tokens)) > 0};
          --color-tokens: #{list.length(map.get($data, color-tokens)) > 0};
          --typography-tokens: #{list.length(map.get($data, typography-tokens)) > 0};
          --density-tokens: #{list.length(map.get($data, density-tokens)) > 0};
        }
      `);
      const vars = getRootVars(css);
      expect(vars['keys'].split(', ')).toEqual([
        'theme-version',
        'theme-type',
        'palettes',
        'color-tokens',
        'typography-tokens',
        'density-scale',
        'density-tokens',
        'base-tokens',
      ]);
      expect(vars['version']).toBe('1');
      expect(vars['type']).toBe('light');
      expect(vars['palettes'].split(', ')).toEqual([
        'primary',
        'secondary',
        'tertiary',
        'neutral',
        'neutral-variant',
        'error',
      ]);
      expect(vars['density']).toBe('0');
      expect(vars['base-tokens']).toBe('true');
      expect(vars['color-tokens']).toBe('true');
      expect(vars['typography-tokens']).toBe('true');
      expect(vars['density-tokens']).toBe('true');
    });

    it('should customize colors', () => {
      const css = transpile(`
        $theme: matx.define-theme((
          color: (
            theme-type: dark,
            primary: matx.$m3-yellow-palette,
            secondary: matx.$m3-orange-palette,
            tertiary: matx.$m3-red-palette,
          )
        ));
        $data: map.get($theme, $internals);
        :root {
          --token-surface: #{map.get($data, color-tokens, (mdc, theme), surface)};
          --token-primary: #{map.get($data, color-tokens, (mdc, theme), primary)};
          --token-secondary: #{map.get($data, color-tokens, (mdc, theme), secondary)};
          --token-tertiary: #{map.get($data, color-tokens, (mdc, theme), tertiary)};
          --palette-primary: #{map.get($data, palettes, primary, 50)};
          --palette-secondary: #{map.get($data, palettes, secondary, 50)};
          --palette-tertiary: #{map.get($data, palettes, tertiary, 50)};
          --type: #{map.get($data, theme-type)};
        }
      `);
      const vars = getRootVars(css);
      expect(vars['token-surface']).toBe('#1c1b1f');
      expect(vars['token-primary']).toBe('#cdcd00');
      expect(vars['token-secondary']).toBe('#ffb95c');
      expect(vars['token-tertiary']).toBe('#ffb4a8');
      expect(vars['palette-primary']).toBe('#7b7b00');
      expect(vars['palette-secondary']).toBe('#a66a00');
      expect(vars['palette-tertiary']).toBe('#ef0000');
      expect(vars['type']).toBe('dark');
    });

    it('should customize typography', () => {
      const css = transpile(`
        $theme: matx.define-theme((
          typography: (
            brand-family: Comic Sans,
            plain-family: Wingdings,
            bold-weight: 300,
            medium-weight: 200,
            regular-weight: 100,
          )
        ));
        $data: map.get($theme, $internals);
        :root {
          --display-font:
            #{map.get($data, typography-tokens, (mdc, typography), display-large-font)};
          --display-weight:
            #{map.get($data, typography-tokens, (mdc, typography), display-large-weight)};
          --title-font:
            #{map.get($data, typography-tokens, (mdc, typography), title-small-font)};
          --title-weight:
            #{map.get($data, typography-tokens, (mdc, typography), title-small-weight)};
        }
      `);
      const vars = getRootVars(css);
      expect(vars['display-font']).toBe('Comic Sans');
      expect(vars['display-weight']).toBe('100');
      expect(vars['title-font']).toBe('Wingdings');
      expect(vars['title-weight']).toBe('200');
    });

    it('should customize density', () => {
      const css = transpile(`
        $theme: matx.define-theme((
          density: (
            scale: -2
          )
        ));
        $data: map.get($theme, $internals);
        :root {
          --size: #{map.get($data, density-tokens, (mdc, checkbox), state-layer-size)};
        }
      `);
      const vars = getRootVars(css);
      expect(vars['size']).toBe('32px');
    });

    it('should throw for invalid system config', () => {
      expect(() => transpile(`$theme: matx.define-theme(5)`)).toThrowError(
        /\$config should be a configuration object\. Got: 5/,
      );
    });

    it('should throw for invalid color config', () => {
      expect(() => transpile(`$theme: matx.define-theme((color: 5))`)).toThrowError(
        /\$config\.color should be a color configuration object\. Got: 5/,
      );
    });

    it('should throw for invalid typography config', () => {
      expect(() => transpile(`$theme: matx.define-theme((typography: 5))`)).toThrowError(
        /\$config\.typography should be a typography configuration object\. Got: 5/,
      );
    });

    it('should throw for invalid density config', () => {
      expect(() => transpile(`$theme: matx.define-theme((density: 5))`)).toThrowError(
        /\$config\.density should be a density configuration object\. Got: 5/,
      );
    });

    it('should throw for invalid config property', () => {
      expect(() => transpile(`$theme: matx.define-theme((fake: 5))`)).toThrowError(
        /\$config has unexpected properties.*Found: fake/,
      );
    });

    it('should throw for invalid color property', () => {
      expect(() => transpile(`$theme: matx.define-theme((color: (fake: 5)))`)).toThrowError(
        /\$config\.color has unexpected properties.*Found: fake/,
      );
    });

    it('should throw for invalid typography property', () => {
      expect(() => transpile(`$theme: matx.define-theme((typography: (fake: 5)))`)).toThrowError(
        /\$config\.typography has unexpected properties.*Found: fake/,
      );
    });

    it('should throw for invalid density property', () => {
      expect(() => transpile(`$theme: matx.define-theme((density: (fake: 5)))`)).toThrowError(
        /\$config\.density has unexpected properties.*Found: fake/,
      );
    });

    it('should throw for invalid theme type', () => {
      expect(() =>
        transpile(`$theme: matx.define-theme((color: (theme-type: black)))`),
      ).toThrowError(/Expected \$config\.color.theme-type to be one of:.*Got: black/);
    });

    it('should throw for invalid palette', () => {
      expect(() =>
        transpile(`$theme: matx.define-theme((color: (tertiary: mat.$red-palette)))`),
      ).toThrowError(/Expected \$config\.color\.tertiary to be a valid M3 palette\. Got:/);
    });

    it('should throw for invalid density scale', () => {
      expect(() => transpile(`$theme: matx.define-theme((density: (scale: 10)))`)).toThrowError(
        /Expected \$config\.density\.scale to be one of:.*Got: 10/,
      );
    });
  });

  describe('define-colors', () => {
    it('should omit non-color info', () => {
      const css = transpile(`
        $theme: matx.define-colors();
        $data: map.get($theme, $internals);
        :root {
          --keys: #{map.keys($data)};
        }
      `);
      const vars = getRootVars(css);
      expect(vars['keys'].split(', ')).toEqual([
        'theme-version',
        'theme-type',
        'palettes',
        'color-tokens',
      ]);
    });
  });

  describe('define-typography', () => {
    it('should omit non-typography info', () => {
      const css = transpile(`
        $theme: matx.define-typography();
        $data: map.get($theme, $internals);
        :root {
          --keys: #{map.keys($data)};
        }
      `);
      const vars = getRootVars(css);
      expect(vars['keys'].split(', ')).toEqual(['theme-version', 'typography-tokens']);
    });
  });

  describe('define-density', () => {
    it('should omit non-color info', () => {
      const css = transpile(`
        $theme: matx.define-density();
        $data: map.get($theme, $internals);
        :root {
          --keys: #{map.keys($data)};
        }
      `);
      const vars = getRootVars(css);
      expect(vars['keys'].split(', ')).toEqual([
        'theme-version',
        'density-scale',
        'density-tokens',
      ]);
    });
  });
});
