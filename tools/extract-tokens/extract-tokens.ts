import {writeFileSync} from 'fs';
import {relative, basename, join} from 'path';
import {compileString} from 'sass';

/** Types of tokens. */
type TokenType = 'base' | 'color' | 'typography' | 'density';

/** Extracted data for a single token. */
interface Token {
  /** Name of the token. */
  name: string;
  /** System token that it was derived from. */
  derivedFrom?: string;
}

// Script that extracts the tokens from a specific Bazel target.
if (require.main === module) {
  const [packagePath, outputPath, ...inputFiles] = process.argv.slice(2);
  const themeFiles = inputFiles.filter(
    file =>
      // Filter out only the files within the package
      // since the path also includes dependencies.
      file.startsWith(packagePath) &&
      // Assumption: all theme files start with an underscore
      // since they're partials and they end with `-theme`.
      basename(file).startsWith('_') &&
      file.endsWith('-theme.scss'),
  );

  if (themeFiles.length === 0) {
    throw new Error(`Could not find theme files in ${packagePath}`);
  }

  const theme = compileTheme(packagePath, themeFiles);
  const base = parseTokens('base', theme);
  const color = parseTokens('color', theme);
  const typography = parseTokens('typography', theme);
  const density = parseTokens('density', theme);

  writeFileSync(
    outputPath,
    JSON.stringify({
      totalTokens: base.length + color.length + typography.length + density.length,
      base,
      color,
      typography,
      density,
    }),
  );
}

/**
 * Compiles a theme from which tokens can be extracted.
 * @param packagePath Path of the package being processed.
 * @param themeFiles File paths of the theme files within the package.
 */
function compileTheme(packagePath: string, themeFiles: string[]): string {
  const imports: string[] = [];
  const base: string[] = [];
  const color: string[] = [];
  const typography: string[] = [];
  const density: string[] = [];

  for (let i = 0; i < themeFiles.length; i++) {
    const localName = `ctx${i}`;
    imports.push(`@use './${relative(packagePath, themeFiles[i])}' as ${localName};`);
    base.push(`@include ${localName}.base($theme);`);
    color.push(`@include ${localName}.color($theme);`);
    typography.push(`@include ${localName}.typography($theme);`);
    density.push(`@include ${localName}.density($theme);`);
  }

  // Note: constructing the theme objects is expensive (takes ~2s locally) so we want to reduce
  // the number of themes we need to compile. We minimize the impact by outputting all the sections
  // into a single theme file and separating them with markers. Later on in the script we can
  // use the markers to group the tokens.
  const theme = `
    @use '../core/theming/definition';
    @use '../core/theming/palettes';
    ${imports.join('\n')}

    $theme: definition.define-theme((
      color: (
        theme-type: light,
        primary: palettes.$azure-palette,
        tertiary: palettes.$blue-palette,
        use-system-variables: true,
      ),
      typography: (use-system-variables: true),
      density: (scale: 0),
    ));

    ${getMarker('base', 'start')} :root {${base.join('\n')}}${getMarker('base', 'end')}
    ${getMarker('color', 'start')} :root {${color.join('\n')}}${getMarker('color', 'end')}
    ${getMarker('typography', 'start')} :root {${typography.join('\n')}}${getMarker('typography', 'end')}
    ${getMarker('density', 'start')} :root {${density.join('\n')}}${getMarker('density', 'end')}
  `;

  // Note: this is using the synchronous `compileString`, even though the Sass docs claim the async
  // version is faster. From local testing the synchronous version was faster (~2s versus ~5s).
  return compileString(theme, {
    loadPaths: [join(process.cwd(), packagePath)],
    sourceMap: false,
  }).css;
}

/**
 * Parses the tokens of a specific type from a compiled theme.
 * @param type Type of tokens to look for.
 * @param theme Theme from which to parse the tokens.
 */
function parseTokens(type: TokenType, theme: string): Token[] {
  const startMarker = getMarker(type, 'start');
  const endMarker = getMarker(type, 'end');
  const sectionText = textBetween(theme, startMarker, endMarker);

  if (sectionText === null) {
    throw new Error(`Could not find parse tokens for ${type}`);
  }

  return (
    (sectionText.match(/\s--.+\s*:.+;/g) || [])
      .map(rawToken => {
        const [name, value] = rawToken.split(':');
        const token: Token = {name: name.trim()};
        // Assumption: tokens whose value contains a system variable
        // reference are derived from that system variable.
        const derivedFrom = textBetween(value, 'var(', ')');
        if (derivedFrom) {
          token.derivedFrom = derivedFrom;
        }
        return token;
      })
      // Sort the tokens by name so they look better in the final output.
      .sort((a, b) => a.name.localeCompare(b.name))
  );
}

/**
 * Creates a marker that can be used to differentiate the section in a theme file.
 * @param type Type of the tokens in the section.
 * @param location Whether this is a start or end token.
 */
function getMarker(type: TokenType, location: 'start' | 'end'): string {
  return `/*! ${type} ${location} */`;
}

/**
 * Gets the substring between two strings.
 * @param text String from which to extract the substring.
 * @param start Start marker of the substring.
 * @param end End marker of the substring.
 */
function textBetween(text: string, start: string, end: string): string | null {
  const startIndex = text.indexOf(start);
  if (startIndex === -1) {
    return null;
  }

  const endIndex = text.indexOf(end, startIndex);
  if (endIndex === -1) {
    return null;
  }

  return text.slice(startIndex + start.length, endIndex);
}
