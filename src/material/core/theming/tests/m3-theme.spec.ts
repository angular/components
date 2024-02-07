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
        @use '../../../../material-experimental/index' as matx;

        $internals: _mat-theming-internals-do-not-access;

        $theme: matx.define-theme();

        ${content}
      `,
    {
      loadPaths: [testDir],
      importers: [localPackageSassImporter, mdcSassImporter],
    },
  ).css.toString();
}

describe('M3 theme', () => {
  it('should emit all styles under the given selector', () => {
    const root = parse(transpile(`html { @include mat.all-component-themes($theme); }`));
    const selectors: string[] = [];
    root.walkRules(rule => {
      selectors.push(rule.selector);
    });
    expect(selectors).toEqual(['html']);
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
});
