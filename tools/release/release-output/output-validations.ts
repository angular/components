import {existsSync, readFileSync} from 'fs';
import {sync as glob} from 'glob';
import {dirname, isAbsolute, join} from 'path';

/** RegExp that matches Angular component inline styles that contain a sourcemap reference. */
const inlineStylesSourcemapRegex = /styles: ?\[["'].*sourceMappingURL=.*["']/;

/** RegExp that matches Angular component metadata properties that refer to external resources. */
const externalReferencesRegex = /(templateUrl|styleUrls): *["'[]/;

/** RegExp that matches TypeScript dynamic import statements. */
const dynamicImportStatement = /import\(["'](.*)["']\)/g;

/**
 * Checks the specified release bundle and ensures that it does not contain
 * any external resource URLs.
 */
export function checkReleaseBundle(bundlePath: string): string[] {
  const bundleContent = readFileSync(bundlePath, 'utf8');
  const failures: string[] = [];

  if (inlineStylesSourcemapRegex.exec(bundleContent) !== null) {
    failures.push('Found sourcemap references in component styles.');
  }

  if (externalReferencesRegex.exec(bundleContent) !== null) {
    failures.push('Found external component resource references');
  }

  return failures;
}

/**
 * Checks the specified TypeScript definition file by ensuring it does not contain invalid
 * dynamic import statements. There can be invalid dynamic imports paths because we compose the
 * release package by moving things in a desired output structure. See Angular package format
 * specification and https://github.com/angular/material2/pull/12876
 */
export function checkTypeDefinitionFile(filePath: string): string[] {
  const baseDir = dirname(filePath);
  const fileContent = readFileSync(filePath, 'utf8');
  const failures = [];

  let match: RegExpMatchArray;

  // Walk through each dynamic import and ensure that the import path is valid within the release
  // output. Note that we don't want to enforce that there are no dynamic imports because type
  // inference is heavily used within the schematics and is useful in some situations.
  while ((match = dynamicImportStatement.exec(fileContent)) !== null) {
    const importPath = match[1];

    if (isAbsolute(importPath)) {
      failures.push('Found absolute dynamic imports in definition file.');
      continue;
    }

    // In case the dynamic import path starts with a dot, we know that this is a relative path
    // and can ensure that the target path exists. Note that we cannot completely rely on
    // "isAbsolute" because dynamic imports can also import from modules (e.g. "my-npm-module")
    if (importPath.startsWith('.') && !existsSync(join(baseDir, `${importPath}.d.ts`))) {
      failures.push('Found relative dynamic imports which do not exist.');
    }
  }

  return failures;
}

/**
 * Checks the Angular Material release package and ensures that prebuilt themes
 * and the theming bundle are built properly.
 */
export function checkMaterialPackage(packagePath: string): string[] {
  const prebuiltThemesPath = join(packagePath, 'prebuilt-themes');
  const themingFilePath = join(packagePath, '_theming.scss');
  const failures: string[] = [];

  if (glob('*.css', {cwd: prebuiltThemesPath}).length === 0) {
    failures.push('No prebuilt themes could be found.');
  }

  if (!existsSync(themingFilePath)) {
    failures.push('The theming bundle could not be found.');
  }

  return failures;
}
