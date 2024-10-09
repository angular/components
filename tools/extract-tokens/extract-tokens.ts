import {readFileSync, writeFileSync} from 'fs';
import {pathToFileURL} from 'url';
import {relative, basename, join, dirname} from 'path';
import {compileString} from 'sass';

/** Extracted data for a single token. */
interface Token {
  /** Name of the token. */
  name: string;
  /** Type of the token (color, typography etc.) */
  type: string;
  /** Places from which the token with the specific name can originate. */
  sources: {
    /** Prefix of the source. */
    prefix: string;
    /** System-level token from which the source dervies its value. */
    derivedFrom?: string;
  }[];
}

/** Extracted map of tokens from the source Sass files. */
type ExtractedTokenMap = {
  [prefix: string]: Record<string, unknown>;
};

// Script that extracts the tokens from a specific Bazel target.
if (require.main === module) {
  const [packagePath, outputPath, ...inputFiles] = process.argv.slice(2);
  const themeFiles = inputFiles
    // Filter out only the files within the package
    // since the path also includes dependencies.
    .filter(file => file.startsWith(packagePath))
    .map(file => {
      // Assumption: all theme files start with an underscore since they're
      // partials and they end with `-theme`.
      // Assumption: the name under which the theme mixin will be available is the
      // same as the file name without the underscore and `-theme.scss`.
      const match = file.match(/_(.*)-theme\.scss$/);
      return match ? {mixinPrefix: match[1], filePath: file} : null;
    })
    .filter(file => !!file);

  if (themeFiles.length === 0) {
    throw new Error(`Could not find theme files in ${packagePath}`);
  }

  const themes: {name: string; overridesMixin: string; tokens: Token[]}[] = [];

  themeFiles.forEach(theme => {
    const tokens = extractTokens(theme.filePath);
    themes.push({
      name: theme.mixinPrefix,
      // This can be derived from the `name` already, but we want the source
      // of truth to be in this repo, instead of whatever page consumes the data.
      overridesMixin: `${theme.mixinPrefix}-overrides`,
      tokens,
    });
  });

  writeFileSync(outputPath, JSON.stringify(themes));
}

/**
 * Extracts the tokens from a theme file.
 * @param themePath Path to the theme from which to extract the tokens.
 */
function extractTokens(themePath: string): Token[] {
  const content = readFileSync(themePath, 'utf8');
  const useStatements = content.match(/@use\s+.+;/g);

  if (useStatements === null) {
    return [];
  }

  const startMarker = '/*! extract tokens start */';
  const endMarker = '/*! extract tokens end */';
  const absoluteThemePath = join(process.cwd(), themePath);
  const srcPath = join(process.cwd(), 'src');
  const {prepend, append} = getTokenExtractionCode(
    srcPath,
    themePath,
    startMarker,
    endMarker,
    useStatements,
  );
  const toCompile = [prepend, content, append].join('\n\n');
  const data: string[] = [];

  // The extraction code will generate an `@debug` statement which logs the resolved tokens to the
  // console in JSON format. This call captures it so it can be parsed.
  // Note: this is using the synchronous `compileString`, even though the Sass docs claim the async
  // version is faster. From local testing the synchronous version was faster (~2s versus ~5s).
  compileString(toCompile, {
    loadPaths: [srcPath],
    url: pathToFileURL(absoluteThemePath),
    sourceMap: false,
    logger: {
      debug: message => {
        const parsed = textBetween(message, startMarker, endMarker);

        if (parsed === null) {
          console.log(message);
        } else {
          data.push(parsed);
        }
      },
    },
  });

  if (data.length === 0) {
    throw new Error(`Could not extract tokens from ${themePath}.`);
  } else if (data.length > 1) {
    throw new Error(`Cannot extract more than one component's tokens per file.`);
  }

  const rawTokens = JSON.parse(data[0]) as {
    color: ExtractedTokenMap;
    typography: ExtractedTokenMap;
    density: ExtractedTokenMap;
    base: ExtractedTokenMap;
  };

  return [
    ...createTokens('color', rawTokens.color),
    ...createTokens('typography', rawTokens.typography),
    ...createTokens('density', rawTokens.density),
    ...createTokens('base', rawTokens.base),
  ];
}

/**
 * Creates the token objects from a token map.
 * @param type Type of tokens being extracted (color, typography etc.).
 * @param groups Extracted data from the Sass file.
 */
function createTokens(type: string, groups: ExtractedTokenMap): Token[] {
  const data: Map<string, Map<string, string | null>> = new Map();

  // First step is to go through the whole data and group the tokens by their name. We need to
  // group the tokens, because the same name can be used by different prefixes (e.g. both
  // `mdc-filled-text-field` and `mdc-outlined-text-field` have a `label-text-color` token).
  Object.keys(groups).forEach(prefix => {
    const tokens = groups[prefix];

    // The token data for some components may be null.
    if (tokens) {
      Object.keys(tokens).forEach(name => {
        let tokenData = data.get(name);

        if (!tokenData) {
          tokenData = new Map();
          data.set(name, tokenData);
        }

        const value = tokens[name];
        const derivedFrom = typeof value === 'string' ? textBetween(value, 'var(', ')') : null;
        tokenData.set(prefix, derivedFrom ? derivedFrom.replace('--sys-', '') : null);
      });
    }
  });

  // After the tokens have been grouped, we can create the `Token` object for each one.
  const result: Token[] = [];

  data.forEach((tokenData, name) => {
    const token: Token = {name, type, sources: []};

    tokenData.forEach((derivedFrom, prefix) => {
      // Set `derivedFrom` to `undefined` if it hasn't been set so it doesn't show up in the JSON.
      token.sources.push({prefix, derivedFrom: derivedFrom || undefined});
    });

    result.push(token);
  });

  // Sort the tokens by name so they're easier to scan.
  return result.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Generates the code that can be added around a theme file in order to extract its tokens.
 * @param srcPath Absolute path to the source root.
 * @param absoluteThemePath Absolute path to the theme.
 * @param startMarker Marker to add in front of the extracted code.
 * @param endMarker Marker to add after the extracted code.
 * @param useStatements Parsed on `@use` statements from the file.
 */
function getTokenExtractionCode(
  srcPath: string,
  absoluteThemePath: string,
  startMarker: string,
  endMarker: string,
  useStatements: string[],
) {
  const meta = '__privateSassMeta';
  const map = '__privateSassMap';
  const list = '__privateSassList';
  const math = '__privateSassMath';
  const m3Tokens = '___privateM3Tokens';
  const palettes = '___privatePalettes';
  const corePath = relative(dirname(absoluteThemePath), join(srcPath, 'material/core')) || '.';

  const prepend = `
    @use 'sass:meta' as ${meta};
    @use 'sass:map' as ${map};
    @use 'sass:list' as ${list};
    @use 'sass:math' as ${math};
    @use '${join(corePath, 'tokens/m3-tokens')}' as ${m3Tokens};
    @use '${join(corePath, 'theming/palettes')}' as ${palettes};
    @use '${join(corePath, 'style/sass-utils')}' as __privateSassUtils;

    // The 'generate-*' functions don't have the ability to enable
    // system tokens so we have to do it by setting a variable.
    __privateSassUtils.$use-system-color-variables: true;
    __privateSassUtils.$use-system-typography-variables: true;
  `;

  // Goes through all the available namespaces looking for a `$prefix` variable. This allows us to
  // determine the prefixes that are used within the theme. Once we know the prefixes we can use
  // them to extract only the tokens we care about from the full token set. Note: `core-theme`
  // is a special case where not all of the imported tokens are supported in the `overrides`
  // mixin. Such cases will expose a `_get-supported-overrides-tokens` private function that
  // can be used to determine the exact set of prefixes that are used.
  // After the tokens are extracted, we log them out using `@debug` and then intercept the log
  // in order to get the raw data. We have to go through `@debug`, because there's no way to
  // output a Sass map to CSS.
  // The tokens are encoded as JSON so we don't have to implement parsing of Sass maps in TS.
  const append = `
    $__prefixes: ();

    @if ${meta}.function-exists('_get-supported-overrides-tokens') {
      $__configs: _get-supported-overrides-tokens();

      @each $config in $__configs {
        $__prefixes: ${list}.append($__prefixes, ${map}.get($config, prefix));
      }
    } @else {
      $__namespaces: (${useStatements.map(stmt => `"${extractNamespace(stmt)}"`).join(', ')});

      @each $name in $__namespaces {
        $prefix: ${map}.get(${meta}.module-variables($name), prefix);

        @if ($prefix) {
          $__prefixes: ${list}.append($__prefixes, $prefix);
        }
      }
    }

    $__all-color: ${m3Tokens}.generate-color-tokens(light, ${palettes}.$azure-palette,
      ${palettes}.$azure-palette, ${palettes}.$azure-palette, 'sys');
    $__all-typography: ${m3Tokens}.generate-typography-tokens(font, 100, 100, 100, 100, 'sys');
    $__all-density: ${m3Tokens}.generate-density-tokens(0);
    $__all-base: ${m3Tokens}.generate-base-tokens();
    $__color: ();
    $__typography: ();
    $__density: ();
    $__base: ();

    @each $prefix in $__prefixes {
      $__color: ${map}.set($__color, $prefix, ${map}.get($__all-color, $prefix));
      $__typography: ${map}.set($__typography, $prefix, ${map}.get($__all-typography, $prefix));
      $__density: ${map}.set($__density, $prefix, ${map}.get($__all-density, $prefix));
      $__base: ${map}.set($__base, $prefix, ${map}.get($__all-base, $prefix));
    }

    // Define our JSON.stringify implementation so it can be used below.
    ${jsonStringifyImplementation('__json-stringify', {meta, list, math})}

    @debug '${startMarker}' + __json-stringify((
      color: $__color,
      typography: $__typography,
      density: $__density,
      base: $__base
    )) + '${endMarker}';
  `;

  return {prepend, append};
}

/**
 * Returns the source of a `JSON.stringify` implementation in Sass that can be inlined into a file.
 * @param name Name for the newly-generated function.
 * @param locals Names which can be used to refer to imported symbols.
 */
function jsonStringifyImplementation(
  name: string,
  locals: {meta: string; list: string; math: string},
) {
  const {meta, list, math} = locals;

  return `
    @function ${name}($value) {
      $type: ${meta}.type-of($value);

      @if ($type == 'map') {
        $current: '';

        @each $key, $value in $value {
          $pair: if($current == '', '', ', ') + '#{__serialize-key($key)}:#{${name}($value)}';
          $current: $current + $pair;
        }

        @return '{#{$current}}';
      } @else if ($type == 'list' and ${list}.length($value) == 0) {
        // A result of '()' can be either a list or a map.
        // In a token context we treat it as an empty map.
        @return '{}';
      } @else if (($type == 'number' and ${math}.is-unitless($value)) or $type == 'bool' or $type == 'null') {
        // Primitive values should be preserved verbatim so they have the correct type when we
        // parse the JSON. Note: Sass considers both 10 and 10px as numbers. We only want to
        // preserve the unitless variable.
        @return ${meta}.inspect($value);
      } @else {
        // All remaining values should be stringified.
        @return '"' + ${meta}.inspect($value) + '"';
      }
    }

    // Keys are joined with using '-' as a separator.
    @function __serialize-key($value) {
      $result: '';
      @each $part in $value {
        $result: if($result == '', $part, '#{$result}-#{$part}');
      }
      @return '"' + $result + '"';
    }
  `;
}

/** Gets the namespace from an `@use` statement. */
function extractNamespace(statement: string): string | null {
  const openQuoteIndex = Math.max(statement.indexOf(`"`), statement.indexOf(`'`));
  const closeQuoteIndex = Math.max(
    statement.indexOf(`"`, openQuoteIndex + 1),
    statement.indexOf(`'`, openQuoteIndex + 1),
  );
  const semicolonIndex = statement.lastIndexOf(';');

  if (openQuoteIndex === -1 || closeQuoteIndex === -1 || semicolonIndex === -1) {
    throw new Error(`Could not parse namespace from ${statement}.`);
  }

  const asExpression = 'as ';
  const asIndex = statement.indexOf(asExpression, closeQuoteIndex);
  const withIndex = statement.indexOf(' with', asIndex);

  // If we found an ` as ` expression, we consider the rest of the text as the namespace.
  if (asIndex > -1) {
    return withIndex == -1
      ? statement.slice(asIndex + asExpression.length, semicolonIndex).trim()
      : statement.slice(asIndex + asExpression.length, withIndex).trim();
  }

  const importPath = statement
    .slice(openQuoteIndex + 1, closeQuoteIndex)
    // Sass allows for leading underscores to be omitted and it technically supports .scss.
    .replace(/^_|\.scss$/g, '');

  // Built-in Sass imports look like `sass:map`.
  if (importPath.startsWith('sass:')) {
    return importPath.split('sass:')[1];
  }

  // Sass ignores `/index` and infers the namespace as the next segment in the path.
  const fileName = basename(importPath);
  return fileName === 'index' ? basename(join(fileName, '..')) : fileName;
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
