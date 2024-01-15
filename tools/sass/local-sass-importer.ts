import {pathToFileURL} from 'url';
import {join} from 'path';
import {FileImporter} from 'sass';

/** Prefix indicating Angular-owned Sass imports. */
const angularPrefix = '@angular/';

/**
 * Creates a Sass `FileImporter` that resolves `@angular/<..>` packages to the
 * specified local packages directory.
 */
export function createLocalAngularPackageImporter(packageDirAbsPath: string): FileImporter {
  return {
    findFileUrl: (url: string) => {
      if (url.startsWith(angularPrefix)) {
        return pathToFileURL(join(packageDirAbsPath, url.substring(angularPrefix.length))) as URL;
      }
      return null;
    },
  };
}
