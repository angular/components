import {readFileSync, writeFileSync} from 'fs';
import {pathToFileURL} from 'url';
import {relative, join, dirname} from 'path';
import {compileString} from 'sass';
import {highlightCodeBlock} from '../highlight-files/highlight-code-block';

/** Information extracted for a single token from the theme. */
interface ExtractedToken {
  /** Name of the token. */
  name: string;
  /** Full prefix of the token. */
  prefix: string;
  /** Type of the token (color, typography etc.) */
  type: string;
  /** Value of the token. */
  value: string | number;
  /** Name under which the token can be referred to inside the `overrides` mixin. */
  overridesName: string;
}

/** Information that will be generated about a token in the final output. */
interface Token {
  /** Name of the token. */
  name: string;
  /** Full prefix of the token. */
  prefix: string;
  /** Type of the token (color, typography etc.) */
  type: string;
  /** Name under which the token can be referred to inside the `overrides` mixin. */
  overridesName: string;
  /** Name of the system-level token that this token was derived from. */
  derivedFrom?: string;
}

/** Information extracted from a theme file. */
interface ThemeData {
  /** Name of the theme file. */
  name: string;
  /** Name of the `overrides` mixin within the file. */
  overridesMixin: string;
  /** Tokens that can be used in the `overrides` mixin. */
  tokens: Token[];
}

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

  const themes: ThemeData[] = [];

  themeFiles.forEach(theme => {
    themes.push({
      name: theme.mixinPrefix,
      // This can be derived from the `name` already, but we want the source
      // of truth to be in this repo, instead of whatever page consumes the data.
      overridesMixin: `${theme.mixinPrefix}-overrides`,
      tokens: extractTokens(theme.filePath),
    });
  });

  writeFileSync(outputPath, JSON.stringify({example: getUsageExample(themes), themes}));
}

/**
 * Extracts the tokens from a theme file.
 * @param themePath Path to the theme from which to extract the tokens.
 */
function extractTokens(themePath: string): Token[] {
  const content = readFileSync(themePath, 'utf8');
  const startMarker = '/*! extract tokens start */';
  const endMarker = '/*! extract tokens end */';
  const root = process.cwd();
  const absoluteThemePath = join(root, themePath);
  const srcPath = join(root, 'src');
  const {prepend, append} = getTokenExtractionCode(srcPath, themePath, startMarker, endMarker);
  const toCompile = [prepend, content, append].join('\n\n');
  const data: string[] = [];

  // The extraction code will generate an `@debug` statement which logs the resolved tokens to the
  // console in JSON format. This call captures it so it can be parsed.
  // Note: this is using the synchronous `compileString`, even though the Sass docs claim the async
  // version is faster. From local testing the synchronous version was faster (~2s versus ~5s).
  compileString(toCompile, {
    loadPaths: [srcPath],
    url: pathToFileURL(absoluteThemePath),
    importers: [
      {
        findFileUrl: (url: string) => {
          const angularPrefix = '@angular/';
          return url.startsWith(angularPrefix)
            ? pathToFileURL(join(srcPath, url.substring(angularPrefix.length)))
            : null;
        },
      },
    ],
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

  const parsedTokens = JSON.parse(data[0]) as ExtractedToken[];

  return parsedTokens.map(token => {
    const value = token.value;
    const derivedFrom = typeof value === 'string' ? textBetween(value, 'var(', ')') : null;

    return {
      name: token.name,
      prefix: token.prefix,
      type: token.type,
      overridesName: token.overridesName,
      // Set to `undefined` so the key gets dropped from the JSON if there's no value.
      derivedFrom: derivedFrom || undefined,
    };
  });
}

/**
 * Generates a highlighted code snippet that illustrates how an overrides mixin can be used.
 * @param themes Themes that were extracted from a specific entrypoint. One of these themes will
 *   be used as an example.
 */
function getUsageExample(themes: ThemeData[]): string | null {
  const mixin = themes.find(theme => theme.tokens.length > 0);

  if (!mixin) {
    return null;
  }

  // Pick out a couple of color tokens to show as examples.
  const firstToken = mixin.tokens.find(token => token.type === 'color');
  const secondToken = mixin.tokens.find(token => token.type === 'color' && token !== firstToken);

  if (!firstToken) {
    return null;
  }

  const lines = [
    `@use '@angular/material' as mat;`,
    ``,
    `// Customize the entire app. Change :root to your selector if you want to scope the styles.`,
    `:root {`,
    `  @include mat.${mixin.overridesMixin}((`,
    `    ${firstToken.overridesName}: orange,`,
    ...(secondToken ? [`    ${secondToken.overridesName}: red,`] : []),
    `  ));`,
    `}`,
  ];

  return highlightCodeBlock(lines.join('\n'), 'scss');
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
) {
  const meta = '__privateSassMeta';
  const map = '__privateSassMap';
  const list = '__privateSassList';
  const math = '__privateSassMath';
  const str = '__privateSassString';
  const stringJoin = '__privateStringJoin';
  const m3Tokens = '___privateM3Tokens';
  const palettes = '___privatePalettes';
  const sassUtils = '__privateSassUtils';
  const inferTokenType = '__privateInferFromValue';
  const defineOverrides = '_define-overrides';
  const corePath = relative(dirname(absoluteThemePath), join(srcPath, 'material/core')) || '.';

  const prepend = `
    @use 'sass:meta' as ${meta};
    @use 'sass:map' as ${map};
    @use 'sass:list' as ${list};
    @use 'sass:math' as ${math};
    @use 'sass:string' as ${str};
    @use '${join(corePath, 'tokens/m3-tokens')}' as ${m3Tokens};
    @use '${join(corePath, 'theming/palettes')}' as ${palettes};
    @use '${join(corePath, 'style/sass-utils')}' as ${sassUtils};

    // The 'generate-*' functions don't have the ability to enable
    // system tokens so we have to do it by setting a variable.
    ${sassUtils}.$use-system-color-variables: true;
    ${sassUtils}.$use-system-typography-variables: true;
  `;

  const append = `
    @if not ${meta}.function-exists('${defineOverrides}') {
      @error 'File must define a ${defineOverrides} function for docs extraction purposes';
    }

    $__all-color: ${m3Tokens}.generate-color-tokens(light, ${palettes}.$azure-palette,
      ${palettes}.$azure-palette, ${palettes}.$azure-palette, 'mat-sys');
    $__all-typography: ${m3Tokens}.generate-typography-tokens(font, 100, 100, 100, 100, 'mat-sys');
    $__all-density: ${m3Tokens}.generate-density-tokens(0);
    $__all-base: ${m3Tokens}.generate-base-tokens();
    $__results: ();
    $__override-tokens: ${defineOverrides}();
    $__override-type: ${meta}.type-of($__override-tokens);

    @if $__override-type != 'list' {
      @error 'Expected override to be a list but got ' + $__override-type;
    }

    // Joins all the strings in a list with a separator.
    @function ${stringJoin}($value, $separator) {
      $result: '';
      @each $part in $value {
        $result: if($result == '', $part, '#{$result}#{$separator}#{$part}');
      }
      @return $result;
    }

    // Uses some simple heuristics to determine the type of a token based on its name or value.
    @function ${inferTokenType}($name, $value) {
      @if ($value == null) {
        @return null;
      }

      $type: ${meta}.type-of($value);
      $inferred-type: null;

      // Note: Sass' string.index returns a 1-based index or null (if the value can't be found)
      // so it's safe to just null check it in the conditions below.
      @if ($type == 'color' or ${str}.index($name, 'shadow') or ${str}.index($name, 'opacity')) {
        $inferred-type: color;
      } @else if (
        ${str}.index($name, 'font') or
        ${str}.index($name, 'line-height') or
        ${str}.index($name, 'tracking') or
        ${str}.index($name, 'weight') or
        (${str}.index($name, 'text') and ${str}.index($name, 'size')) or
        (${str}.index($name, 'text') and ${str}.index($name, 'transform'))
      ) {
        $inferred-type: typography;
      } @else if (${str}.index($name, 'width') or ${str}.index($name, 'height')) {
        $inferred-type: density;
      } @else if ($type == 'string' or ${str}.index($name, 'shape')) {
        $inferred-type: base;
      }

      @return $inferred-type;
    }

    @each $map in $__override-tokens {
      $namespace: ${map}.get($map, namespace);
      $tokens: ${map}.get($map, tokens);
      $prefix: ${map}.get($map, prefix) or '';
      $color: ${map}.get($__all-color, $namespace) or ();
      $base: ${map}.get($__all-base, $namespace) or ();
      $typography: ${map}.get($__all-typography, $namespace) or ();
      $density: ${map}.get($__all-density, $namespace) or ();

      @each $name, $resolved-value in $tokens {
        $color-value: ${map}.get($color, $name);
        $base-value: ${map}.get($base, $name);
        $typography-value: ${map}.get($typography, $name);
        $density-value: ${map}.get($density, $name);

        $type: '';
        $value: null;

        @if ($base-value) {
          $type: base;
          $value: $base-value;
        } @else if ($typography-value) {
          $type: typography;
          $value: $typography-value;
        } @else if ($density-value) {
          $type: density;
          $value: $density-value;
        } @else {
          $type: color;
          $value: $color-value;
        }

        // If the token has a value, but could not be found in the token maps, try to infer its type
        // from the name and value. This is fairly rare, but can happen for some hardcoded tokens.
        @if ($value == null and $resolved-value) {
          $fallback-type: ${inferTokenType}($name, $resolved-value);

          @if ($fallback-type == null) {
            @error 'Cannot determine type of token "#{$name}". Token extraction script needs to be updated.';
          }

          $type: $fallback-type;
          $value: $resolved-value;
        }

        @if ($value) {
          $__results: ${list}.append($__results, (
            name: ${str}.unquote($name),
            value: $value,
            type: $type,
            prefix: ${str}.unquote(${stringJoin}($namespace, '-')),
            overridesName: ${str}.unquote($prefix + $name),
          )) !global;
        }
      }
    }

    // Define our JSON.stringify implementation so it can be used below.
    ${jsonStringifyImplementation('__json-stringify', {meta, math, stringJoin})}

    @debug '${startMarker}' + __json-stringify($__results) + '${endMarker}';
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
  locals: {meta: string; math: string; stringJoin: string},
) {
  const {meta, math, stringJoin} = locals;

  return `
    @function ${name}($value) {
      $type: ${meta}.type-of($value);

      @if ($type == 'map') {
        $current: '';

        @each $key, $inner in $value {
          $pair: if($current == '', '', ', ') + '"#{${stringJoin}($key, '-')}":#{${name}($inner)}';
          $current: $current + $pair;
        }

        @return '{#{$current}}';
      } @else if ($type == 'list') {
        $current: '';
        @each $inner in $value {
          $current: $current + (if($current == '', '', ', ') + ${name}($inner));
        }
        @return '[#{$current}]';
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
  `;
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
