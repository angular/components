import {task, src, dest} from 'gulp';
import {Dgeni} from 'dgeni';
import {buildConfig} from 'material2-build-tools';
import * as glob from 'glob';
import * as fs from 'fs';
import * as path from 'path';

// There are no type definitions available for these imports.
const markdown = require('gulp-markdown');
const transform = require('gulp-transform');
const highlight = require('gulp-highlight-files');
const rename = require('gulp-rename');
const flatten = require('gulp-flatten');
const htmlmin = require('gulp-htmlmin');
const hljs = require('highlight.js');
const dom  = require('gulp-dom');

const {outputDir, packagesDir} = buildConfig;

const DIST_DOCS = path.join(outputDir, 'docs');

// Our docs contain comments of the form `<!-- example(...) -->` which serve as placeholders where
// example code should be inserted. We replace these comments with divs that have a
// `material-docs-example` attribute which can be used to locate the divs and initialize the example
// viewer.
const EXAMPLE_PATTERN = /<!--\W*example\(([^)]+)\)\W*-->/g;

// Markdown files can contain links to other markdown files.
// Most of those links don't work in the Material docs, because the paths are invalid in the
// documentation page. Using a RegExp to rewrite links in HTML files to work in the docs.
const LINK_PATTERN = /(<a[^>]*) href="([^"]*)"/g;

// HTML tags in the markdown generated files that should receive a .docs-markdown-${tagName} class
// for styling purposes.
const MARKDOWN_TAGS_TO_CLASS_ALIAS = [
  'a',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'li',
  'ol',
  'p',
  'table',
  'tbody',
  'td',
  'th',
  'tr',
  'ul',
  'pre',
  'code',
];

// Options for the html-minifier that minifies the generated HTML files.
const htmlMinifierOptions = {
  collapseWhitespace: true,
  removeComments: true,
  caseSensitive: true,
  removeAttributeQuotes: false
};

/** Generate all docs content. */
task('docs', [
  'markdown-docs',
  'build-examples-module',
  'highlight-examples',
  'api-docs',
  'minified-api-docs',
  'plunker-example-assets',
]);

/** Generates html files from the markdown overviews and guides. */
task('markdown-docs', () => {
  return src(['src/lib/**/*.md', 'guides/*.md'])
      .pipe(markdown({
        // Add syntax highlight using highlight.js
        highlight: (code: string, language: string) => {
          if (language) {
            // highlight.js expects "typescript" written out, while Github supports "ts".
            let lang = language.toLowerCase() === 'ts' ? 'typescript' : language;
            return hljs.highlight(lang, code).value;
          }

          return code;
        }
      }))
      .pipe(transform(transformMarkdownFiles))
      .pipe(dom(createTagNameAliaser('docs-markdown')))
      .pipe(dest('dist/docs/markdown'));
});

/**
 * Creates syntax-highlighted html files from the examples to be used for the source view of
 * live examples on the docs site.
 */
task('highlight-examples', () => {
  // rename files to fit format: [filename]-[filetype].html
  const renameFile = (path: any) => {
    const extension = path.extname.slice(1);
    path.basename = `${path.basename}-${extension}`;
  };

  return src('src/material-examples/**/*.+(html|css|ts)')
      .pipe(flatten())
      .pipe(rename(renameFile))
      .pipe(highlight())
      .pipe(dest('dist/docs/examples'));
});

/** Generates API docs from the source JsDoc using dgeni. */
task('api-docs', () => {
  const docsPackage = require(path.resolve(__dirname, '../../dgeni'));
  const docs = new Dgeni([docsPackage]);
  return docs.generate();
});

/** Generates minified html api docs. */
task('minified-api-docs', ['api-docs'], () => {
  return src('dist/docs/api/*.html')
    .pipe(htmlmin(htmlMinifierOptions))
    .pipe(dest('dist/docs/api/'));
});

/** Copies example sources to be used as plunker assets for the docs site. */
task('plunker-example-assets', () => {
  src(path.join(packagesDir, 'material-examples', '**/*'))
      .pipe(dest(path.join(DIST_DOCS, 'plunker', 'examples')));
});

/** Updates the markdown file's content to work inside of the docs app. */
function transformMarkdownFiles(buffer: Buffer, file: any): string {
  let content = buffer.toString('utf-8');

  // Replace <!-- example(..) --> comments with HTML elements.
  content = content.replace(EXAMPLE_PATTERN, (_match: string, name: string) =>
    `<div material-docs-example="${name}"></div>`
  );

  // Replace the URL in anchor elements inside of compiled markdown files.
  content = content.replace(LINK_PATTERN, (_match: string, head: string, link: string) =>
    // The head is the first match of the RegExp and is necessary to ensure that the RegExp matches
    // an anchor element. The head will be then used to re-create the existing anchor element.
    // If the head is not prepended to the replaced value, then the first match will be lost.
    `${head} href="${fixMarkdownDocLinks(link, file.path)}"`
  );

  // Finally, wrap the entire generated in a doc in a div with a specific class.
  return `<div class="docs-markdown">${content}</div>`;
}

/** Fixes paths in the markdown files to work in the material-docs-io. */
function fixMarkdownDocLinks(link: string, filePath: string): string {
  // As for now, only markdown links that are relative and inside of the guides/ directory
  // will be rewritten.
  if (!filePath.includes(path.normalize('guides/')) || link.startsWith('http')) {
    return link;
  }

  let baseName = path.basename(link, path.extname(link));

  // Temporary link the file to the /guide URL because that's the route where the
  // guides can be loaded in the Material docs.
  return `guide/${baseName}`;
}

/**
 * Returns a function to be called with an HTML document as its context that aliases HTML tags by
 * adding a class consisting of a prefix + the tag name.
 * @param classPrefix The prefix to use for the alias class.
 */
function createTagNameAliaser(classPrefix: string) {
  return function() {
    MARKDOWN_TAGS_TO_CLASS_ALIAS.forEach(tag => {
      for (let el of this.querySelectorAll(tag)) {
        el.classList.add(`${classPrefix}-${tag}`);
      }
    });

    return this;
  };
}

interface ExampleMetadata {
  component: string;
  filename: string;
  id: string;
  title: string;
  additionalComponents?: any[];
  additionalFiles?: string;
  selectorName?: string;
}

/**
 * Builds the template for the examples module
 * @param results
 */
const buildTemplate = (results: ExampleMetadata[]): string => {
  // create the import statements
  const imports = (res: ExampleMetadata): string => {
    const components = [res.component];

    if (res.additionalComponents) {
      components.push(...res.additionalComponents);
    }

    return `import {${components.join(',')}} from '${res.filename}';
  `;
  };

  // create the examples metadat
  const examples = (res: ExampleMetadata): string => {
    return `'${res.id}': {
        title: '${res.title}',
        component: ${res.component},
        additionalFiles: ${res.additionalFiles ? ('[' + res.additionalFiles + ']') : 'undefined'},
        selectorName: ${res.selectorName ? ("'" + res.selectorName + "'") : 'undefined'}
    },
    `;
  };

  // create the examples component list
  const list = (res: ExampleMetadata): string => {
    const components = [res.component];

    if (res.additionalComponents) {
      components.push(...res.additionalComponents);
    }
    return `${components.join(',')},
    `;
  };

  return `
  import {NgModule} from '@angular/core';
  import {FormsModule, ReactiveFormsModule} from '@angular/forms';
  import {CommonModule} from '@angular/common';
  import {
    MdAutocompleteModule, MdButtonModule, MdButtonToggleModule,
    MdCardModule, MdCheckboxModule, MdChipsModule, MdDatepickerModule,
    MdDialogModule, MdGridListModule, MdIconModule, MdInputModule,
    MdListModule, MdMenuModule, MdProgressBarModule, MdProgressSpinnerModule,
    MdRadioModule, MdSelectModule, MdSidenavModule, MdSliderModule,
    MdSlideToggleModule, MdSnackBarModule, MdTabsModule, MdToolbarModule, MdTooltipModule
  } from '@angular/material';

  export interface LiveExample {
    title: string;
    component: any;
    additionalFiles?: string[];
    selectorName?: string;
  }

  ${results.map(r => imports(r)).join('').trim()}

  export const EXAMPLE_COMPONENTS = {
    ${results.map(r => examples(r)).join('').trim()}
  };

  @NgModule({
    exports: [
      MdAutocompleteModule,
      MdButtonModule,
      MdButtonToggleModule,
      MdCardModule,
      MdCheckboxModule,
      MdChipsModule,
      MdDatepickerModule,
      MdDialogModule,
      MdGridListModule,
      MdIconModule,
      MdInputModule,
      MdListModule,
      MdMenuModule,
      MdProgressBarModule,
      MdProgressSpinnerModule,
      MdRadioModule,
      MdSelectModule,
      MdSlideToggleModule,
      MdSliderModule,
      MdSidenavModule,
      MdSnackBarModule,
      MdTabsModule,
      MdToolbarModule,
      MdTooltipModule
    ]
  })
  export class ExampleMaterialModule {}

  export const EXAMPLE_LIST = [
    ${results.map(r => list(r)).join('').trim()}
  ];

  @NgModule({
    declarations: EXAMPLE_LIST,
    entryComponents: EXAMPLE_LIST,
    imports: [
      ExampleMaterialModule,
      FormsModule,
      ReactiveFormsModule,
      CommonModule,
    ]
  })
  export class ExampleModule { }
`;
};

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

      // get the decorator tags, not all required
      const titleMatch = src.match(/@title.*/g);
      const idMatch = /@id.*/.exec(src);
      const compMatch = /@component.*/.exec(src);
      const fileMatch = /@additionalFiles.*/.exec(src);
      const selectorMatch = /@selectorName.*/.exec(src);
      const addlCompsMatch = /@addlComponents.*/.exec(src);

      // only move forward if decorated w/ title, id and component
      if (titleMatch && idMatch && compMatch) {
        const title = titleMatch[0].replace('@title ', '');
        const id = idMatch[0].replace('@id ', '');
        const component = compMatch[0].replace('@component ', '');
        const example: ExampleMetadata = {
          filename,
          component,
          title,
          id
        };

        // additional files required for the examples
        if (fileMatch) {
          example.additionalFiles = fileMatch[0]
            .replace('@additionalFiles ', '')
            .split(',')
            .map(r => (`'${r}'`))
            .join(',');
        }

        // The selector name component list mainly used for dialogs
        if (selectorMatch) {
          example.selectorName = selectorMatch[0].replace('@selectorName ', '');
        }

        // additional components are components that the example requires
        // this is different from selectName component list. e.g. snackbar
        if (addlCompsMatch) {
          const additionalComponents = addlCompsMatch[0].replace('@addlComponents ', '');
          example.additionalComponents = additionalComponents.split(',').map(r => r.trim());
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
