import * as fs from 'fs';
import * as path from 'path';
import {parseExampleFile} from './parse-example-file';

interface ExampleMetadata {
  /** Name of the example component. */
  componentName: string;
  /** Path to the source file that declares this example. */
  sourcePath: string;
  /** Path to the directory containing this example. */
  packagePath: string;
  /** Selector to match the component of this example. */
  selector: string;
  /** Unique id for this example. */
  id: string;
  /** Title of the example. */
  title: string;
  /** Additional components for this example. */
  additionalComponents: string[];
  /** Files for this example. */
  files: string[];
  /** Path from which to import the xample. */
  importPath: string;
}

interface AnalyzedExamples {
  exampleMetadata: ExampleMetadata[];
}

/** Inlines the example module template with the specified parsed data. */
function inlineExampleModuleTemplate(parsedData: AnalyzedExamples): string {
  const {exampleMetadata} = parsedData;
  const exampleComponents = exampleMetadata.reduce((result, data) => {
    if (result[data.id] !== undefined) {
      throw Error(`Multiple examples with the same id have been discovered: ${data.id}`);
    }

    result[data.id] = {
      packagePath: data.packagePath,
      title: data.title,
      componentName: data.componentName,
      files: data.files,
      selector: data.selector,
      additionalComponents: data.additionalComponents,
      primaryFile: path.basename(data.sourcePath),
      importPath: data.importPath,
    };

    return result;
  }, {} as any);

  const loadText = [
    `export async function loadExample(id: string): Promise<any> {`,
    `  switch (id) {`,
    ...exampleMetadata.map(
      data =>
        `  case '${data.id}':\nreturn import('@angular/components-examples/${data.importPath}');`,
    ),
    `    default:\nreturn undefined;`,
    `  }`,
    '}',
  ].join('\n');

  return (
    fs
      .readFileSync(require.resolve('./example-module.template'), 'utf8')
      .replace(/\${exampleComponents}/g, JSON.stringify(exampleComponents, null, 2)) + loadText
  );
}

/** Converts a given camel-cased string to a dash-cased string. */
function convertToDashCase(name: string): string {
  name = name.replace(/[A-Z]/g, ' $&');
  name = name.toLowerCase().trim();
  return name.split(' ').join('-');
}

/**
 * Analyzes the examples by parsing the given TypeScript files in order to find
 * individual example modules and example metadata.
 */
function analyzeExamples(sourceFiles: string[], baseDir: string): AnalyzedExamples {
  const exampleMetadata: ExampleMetadata[] = [];

  for (const sourceFile of sourceFiles) {
    const relativePath = path.relative(baseDir, sourceFile).replace(/\\/g, '/');
    const packagePath = path.dirname(relativePath);
    const importPath = path.dirname(packagePath);

    // Avoid parsing non-example files.
    if (!path.basename(sourceFile, path.extname(sourceFile)).endsWith('-example')) {
      continue;
    }

    const sourceContent = fs.readFileSync(sourceFile, 'utf-8');
    const {primaryComponent, secondaryComponents} = parseExampleFile(sourceFile, sourceContent);

    if (primaryComponent) {
      // Generate a unique id for the component by converting the class name to dash-case.
      const exampleId = convertToDashCase(primaryComponent.componentName.replace('Example', ''));
      const example: ExampleMetadata = {
        sourcePath: relativePath,
        packagePath,
        id: exampleId,
        selector: primaryComponent.selector,
        componentName: primaryComponent.componentName,
        title: primaryComponent.title.trim(),
        additionalComponents: [],
        files: [],
        importPath,
      };

      // For consistency, we expect the example component selector to match
      // the id of the example.
      const expectedSelector = `${exampleId}-example`;
      if (primaryComponent.selector !== expectedSelector) {
        throw Error(
          `Example ${exampleId} uses selector: ${primaryComponent.selector}, ` +
            `but expected: ${expectedSelector}`,
        );
      }

      example.files.push(path.basename(relativePath));
      if (primaryComponent.templateUrl) {
        example.files.push(primaryComponent.templateUrl);
      }
      if (primaryComponent.styleUrls) {
        example.files.push(...primaryComponent.styleUrls);
      }
      if (primaryComponent.componentName.includes('Harness')) {
        example.files.push(primaryComponent.selector + '.spec.ts');
      }

      if (secondaryComponents.length) {
        for (const meta of secondaryComponents) {
          example.additionalComponents.push(meta.componentName);
          if (meta.templateUrl) {
            example.files.push(meta.templateUrl);
          }
          if (meta.styleUrls) {
            example.files.push(...meta.styleUrls);
          }
        }
      }

      // Ensure referenced files actually exist in the example.
      example.files.forEach(f => assertReferencedExampleFileExists(baseDir, packagePath, f));
      exampleMetadata.push(example);
    } else {
      throw Error(
        `Could not find a primary example component in ${sourceFile}. ` +
          `Ensure that there's a component with an @title annotation.`,
      );
    }
  }

  return {exampleMetadata};
}

/** Asserts that the given file exists for the specified example. */
function assertReferencedExampleFileExists(
  baseDir: string,
  examplePackagePath: string,
  relativePath: string,
) {
  if (!fs.existsSync(path.join(baseDir, examplePackagePath, relativePath))) {
    throw Error(
      `Example "${examplePackagePath}" references "${relativePath}", but file does not exist.`,
    );
  }
}

/**
 * Generates the example module from the given source files and writes it to a specified output
 * file.
 */
export function generateExampleModule(
  sourceFiles: string[],
  outputFile: string,
  baseDir: string = path.dirname(outputFile),
) {
  const analysisData = analyzeExamples(sourceFiles, baseDir);
  const generatedModuleFile = inlineExampleModuleTemplate(analysisData);

  fs.writeFileSync(outputFile, generatedModuleFile);
}
