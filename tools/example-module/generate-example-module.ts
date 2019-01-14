import * as fs from 'fs';
import * as path from 'path';
import {parseExampleFile} from './parse-example-file';

interface ExampleMetadata {
  className: string;
  type: string;
  sourcePath: string;
  id: string;
  title: string;
  additionalComponents: string[];
  additionalDirectives: string[];
  additionalFiles: string[];
  selectorName: string[];
}

/** Build ES module import statements for the given example metadata. */
function buildImportsTemplate(data: ExampleMetadata): string {
  const components = data.additionalComponents
    .concat(data.className)
    .concat(data.additionalDirectives);
  const relativeSrcPath = data.sourcePath.replace(/\\/g, '/').replace('.ts', '');

  return `import {${components.join(',')}} from './${relativeSrcPath}';`;
}

/** Inlines the example module template with the specified parsed data. */
function inlineExampleModuleTemplate(parsedData: ExampleMetadata[]): string {
  const exampleImports = parsedData.map(m => buildImportsTemplate(m)).join('\n');
  const quotePlaceholder = '◬';
  const entryPointList = parsedData
    .filter(data => data.type === 'component')
    .reduce((result, data) => {
      return result.concat(data.className).concat(data.additionalComponents);
    }, [] as string[]);
  const declarationsList = parsedData
    .reduce((result, data) => {
      return result
        .concat(data.className)
        .concat(data.additionalComponents)
        .concat(data.additionalDirectives);
    }, [] as string[]);

  const exampleComponents = parsedData.reduce((result, data) => {
    result[data.id] = {
      title: data.title,
      // Since we use JSON.stringify to output the data below, the `component` will be wrapped
      // in quotes, whereas we want a reference to the class. Add placeholder characters next to
      // where the quotes will be so that we can strip them away afterwards.
      component: `${quotePlaceholder}${data.className}${quotePlaceholder}`,
      additionalFiles: data.additionalFiles,
      selectorName: data.selectorName.join(', '),
    };

    return result;
  }, {} as any);

  return fs.readFileSync(require.resolve('./example-module.template'), 'utf8')
    .replace('${exampleImports}', exampleImports)
    .replace('${exampleComponents}', JSON.stringify(exampleComponents, null, 2))
    .replace('${DECLARATIONS_LIST}', `[\n  ${declarationsList.join(',\n  ')}\n]`)
    .replace('${entryPointList}', `[\n  ${entryPointList.join(',\n  ')}\n]`)
    .replace(new RegExp(`"${quotePlaceholder}|${quotePlaceholder}"`, 'g'), '');
}

/** Converts a given camel-cased string to a dash-cased string. */
function convertToDashCase(name: string): string {
  name = name.replace(/[A-Z]/g, ' $&');
  name = name.toLowerCase().trim();
  return name.split(' ').join('-');
}

/** Collects the metadata of the given source files by parsing the given TypeScript files. */
function collectExampleMetadata(sourceFiles: string[], baseFile: string): ExampleMetadata[] {
  const exampleMetadata: ExampleMetadata[] = [];
  for (const sourceFile of sourceFiles) {
    const sourceContent = fs.readFileSync(sourceFile, 'utf-8');
    const {primaryComponent, secondaryComponents} = parseExampleFile(sourceFile, sourceContent);

    if (primaryComponent) {
      // Generate a unique id for the component by converting the class name to dash-case.
      const exampleId = convertToDashCase(primaryComponent.className.replace('Example', ''));
      const example: ExampleMetadata = {
        sourcePath: path.relative(baseFile, sourceFile),
        id: exampleId,
        type: primaryComponent.type,
        className: primaryComponent.className,
        title: primaryComponent.title.trim(),
        additionalComponents: [],
        additionalDirectives: [],
        additionalFiles: [],
        selectorName: []
      };

      if (secondaryComponents.length) {
        example.selectorName.push(example.className);

        console.log(secondaryComponents);
        for (const meta of secondaryComponents) {
          if (meta.type === 'component') {
            example.additionalComponents.push(meta.className);
          } else {
            example.additionalDirectives.push(meta.className);
          }


          if (meta.templateUrl) {
            example.additionalFiles.push(meta.templateUrl);
          }

          if (meta.styleUrls) {
            example.additionalFiles.push(...meta.styleUrls);
          }

          example.selectorName.push(meta.className);
        }
      }

      exampleMetadata.push(example);
    }
  }

  return exampleMetadata;
}

/**
 * Generates the example module from the given source files and writes it to a specified output
 * file.
 */
export function generateExampleModule(sourceFiles: string[], outputFile: string,
                                      baseDir: string = path.dirname(outputFile)) {
  const results = collectExampleMetadata(sourceFiles, baseDir);
  const generatedModuleFile = inlineExampleModuleTemplate(results);

  fs.writeFileSync(outputFile, generatedModuleFile);
}
