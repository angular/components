import {task} from 'gulp';
import * as glob from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

interface ExampleMetadata {
  component: string;
  filename: string;
  id: string;
  title: string;
  additionalComponents: string[];
  additionalFiles: string[];
  selectorName: string[];
}

/**
 * Build the import template
 * 
 * @param {ExampleMetadata} metadata 
 * @returns {string} template
 */
function buildImportsTemplate(metadata: ExampleMetadata): string {
  const components = [metadata.component];

  if (metadata.additionalComponents) {
    components.push(...metadata.additionalComponents);
  }

  return `import {${components.join(',')}} from '${metadata.filename}';
`;
}

/**
 * Build the examples template
 * 
 * @param {ExampleMetadata} metadata 
 * @returns {string} template
 */
function buildExamplesTemplate(metadata: ExampleMetadata): string {
  const addlFiles = metadata.additionalFiles ? 
    JSON.stringify(metadata.additionalFiles) : 'undefined';

  const selectorName = metadata.selectorName ? 
    ("'" + metadata.selectorName.join(', ') + "'") : 'undefined';

  return `'${metadata.id}': {
    title: '${metadata.title}',
    component: ${metadata.component},
    additionalFiles: ${addlFiles},
    selectorName: ${selectorName}
  },
  `;
}

/**
 * Build the list template
 * 
 * @param {ExampleMetadata} metadata 
 * @returns {string} 
 */
function buildListTemplate(metadata: ExampleMetadata): string {
  const components = [metadata.component];

  if (metadata.additionalComponents) {
    components.push(...metadata.additionalComponents);
  }
  return `${components.join(',')},
  `;
}

/**
 * Builds the template for the examples module
 * 
 * @param {ExampleMetadata[]} extractedMetadata 
 * @returns {string} resulting template
 */
function buildTemplate(extractedMetadata: ExampleMetadata[]): string {
  return `
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ExampleMaterialModule} from './material-module';

export interface LiveExample {
  title: string;
  component: any;
  additionalFiles?: string[];
  selectorName?: string;
}

${extractedMetadata.map(r => buildImportsTemplate(r)).join('').trim()}

export const EXAMPLE_COMPONENTS = {
  ${extractedMetadata.map(r => buildExamplesTemplate(r)).join('').trim()}
};

export const EXAMPLE_LIST = [
  ${extractedMetadata.map(r => buildListTemplate(r)).join('').trim()}
];

@NgModule({
  declarations: EXAMPLE_LIST,
  entryComponents: EXAMPLE_LIST,
  imports: [
    ExampleMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ]
})
export class ExampleModule { }
`;
}

/**
 * Given a string that is a camel or pascal case,
 * this function will convert to dash case.
 * 
 * @param {string} name 
 * @returns {string} 
 */
function convertToDashCase(name: string): string {
  name = name.replace(/[A-Z]/g, ' $&');
  name = name.toLowerCase().trim();
  return name.split(' ').join('-')
}

/**
 * Parse the AST of a file and get metadata about it
 * 
 * @param {string} filename 
 * @param {string} src 
 * @returns {{ primary: any, seconds: any[] }} 
 */
function createMetas(filename: string, src: string): { primaryComponent: any, secondaryComponents: any[] } {
  const sourceFile = ts.createSourceFile(
    filename, src, ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);

  const metas: any[] = [];

  const visit = (node: any): void => {
    if (node.kind === ts.SyntaxKind.ClassDeclaration) {
      const meta: any = {
        component: node.name.text
      };

      let primary = false;
      if(node.jsDoc && node.jsDoc.length) {
        for(const doc of node.jsDoc) {
          if(doc.tags && doc.tags.length) {
            for(const tag of doc.tags) {
              const tagValue = tag.comment;
              const tagName = tag.tagName.text;
              if(tagName === 'title') {
                meta.title = tagValue;
                meta.primary = true;
              }
            }
          }
        }
      }

      if (node.decorators && node.decorators.length) {
        for (const decorator of node.decorators) {
          if (decorator.expression.expression.text === 'Component') {
            for (const arg of decorator.expression.arguments) {
              for (const prop of arg.properties) {
                const name = prop.name.text;
                const value = prop.initializer.text;
                meta[name] = value;
              }
            }
          }
        }
      }

      metas.push(meta);
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return {
    primaryComponent: metas.find(m => m.primary),
    secondaryComponents: metas.filter(m => !m.primary)
  };
}

/**
 * Creates the examples module and metadata
 */
task('build-examples-module', (cb) => {
  const results: ExampleMetadata[] = [];

  glob('src/material-examples/**/*.ts', (err, matches) => {
    if (err) {
      throw err;
    }

    for (const match of matches) {
      const src = fs.readFileSync(match, 'utf-8');
      const filename = match
        .replace('src/material-examples/', './')
        .replace('.ts', '');
       
      const { primaryComponent, secondaryComponents } = createMetas(match, src);

      if(primaryComponent) {
        // convert the class name to dashcase id
        let id = primaryComponent.component.replace('Example', '');
        id = convertToDashCase(id);
        
        const example: ExampleMetadata = {
          filename,
          id,
          component: primaryComponent.component,
          title: primaryComponent.title,
          additionalComponents: [],
          additionalFiles: [],
          selectorName: []
        };

        if(secondaryComponents.length) {
          // for whatever reason the primary is listed here
          example.selectorName.push(example.component);

          for(const meta of secondaryComponents) {
            example.additionalComponents.push(meta.component);
            example.additionalFiles.push(meta.templateUrl);
            example.selectorName.push(meta.component);
          }
        }

        results.push(example);
      }
    }

    const template = buildTemplate(results);
    const outFile = path.resolve('./src/material-examples/example-module.ts');
    fs.writeFileSync(outFile, template);

    cb();
  });
});
