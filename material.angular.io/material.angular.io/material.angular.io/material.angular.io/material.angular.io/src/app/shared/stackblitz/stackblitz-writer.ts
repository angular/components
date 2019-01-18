import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {VERSION} from '@angular/material';
import {ExampleData} from '@angular/material-examples';

import {materialVersion} from '../version/version';

const STACKBLITZ_URL = 'https://run.stackblitz.com/api/angular/v1';

const COPYRIGHT =
  `Copyright 2018 Google Inc. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at http://angular.io/license`;

/**
 * Path that refers to the docs-content from the "@angular/material-examples" package. The
 * structure is defined in the Material repository, but we include the docs-content as assets in
 * in the CLI configuration.
 */
const DOCS_CONTENT_PATH = '/docs-content/examples-source/';

const TEMPLATE_PATH = '/assets/stackblitz/';
const TEMPLATE_FILES = [
  'index.html',
  'styles.css',
  'polyfills.ts',
  '.angular-cli.json',
  'main.ts',
  'material-module.ts',
];

const TAGS: string[] = ['angular', 'material', 'example'];
const angularVersion = '>=7.0.0';

const dependencies = {
  '@angular/cdk': materialVersion,
  '@angular/material': materialVersion,
  '@angular/material-moment-adapter': materialVersion,
  '@angular/animations': angularVersion,
  '@angular/common': angularVersion,
  '@angular/compiler': angularVersion,
  '@angular/core': angularVersion,
  '@angular/forms': angularVersion,
  '@angular/http': angularVersion,
  '@angular/platform-browser': angularVersion,
  '@angular/platform-browser-dynamic': angularVersion,
  '@angular/router': angularVersion,
  'angular-in-memory-web-api': '~0.5.0',
  'core-js': '^2.4.1',
  'rxjs': '>=6.0.0-beta.0 <7.0.0',
  'web-animations-js': '^2.3.1',
  'zone.js': '^0.8.14',
  'hammerjs': '^2.0.8',
  'moment': '^2.18.1',
};

/**
 * Stackblitz writer, write example files to stackblitz
 *
 * StackBlitz API
 * URL: https://run.stackblitz.com/api/aio/v1/
 * data: {
 *   // File name, directory and content of files
 *   files[file-name1]: file-content1,
 *   files[directory-name/file-name2]: file-content2,
 *   // Can add multiple tags
 *   tags[0]: tag-0,
 *   // Description of stackblitz
 *   description: description,
 *   // Private or not
 *   private: true
 *  // Dependencies
 *  dependencies: dependencies
 * }
 */
@Injectable()
export class StackblitzWriter {
  constructor(private _http: HttpClient) {}

  /**
   * Returns an HTMLFormElement that will open a new stackblitz template with the example data when
   * called with submit().
   */
  constructStackblitzForm(data: ExampleData): Promise<HTMLFormElement> {
    const indexFile = `app%2F${data.indexFilename}.ts`;
    const form = this._createFormElement(indexFile);

    TAGS.forEach((tag, i) => this._appendFormInput(form, `tags[${i}]`, tag));
    this._appendFormInput(form, 'private', 'true');
    this._appendFormInput(form, 'description', data.description);
    this._appendFormInput(form, 'dependencies', JSON.stringify(dependencies));

    return new Promise(resolve => {
      let templateContents = TEMPLATE_FILES
          .map(file => this._readFile(form, data, file, TEMPLATE_PATH));

      let exampleContents = data.exampleFiles
          .map(file => this._readFile(form, data, file, DOCS_CONTENT_PATH));

      // TODO(josephperrott): Prevent including assets to be manually checked.
      if (data.selectorName === 'icon-svg-example') {
        this._readFile(form, data, 'assets/img/examples/thumbup-icon.svg', '', false);
      }

      Promise.all(templateContents.concat(exampleContents)).then(() => {
        resolve(form);
      });
    });
  }

  /** Constructs a new form element that will navigate to the stackblitz url. */
  _createFormElement(indexFile: string): HTMLFormElement {
    const form = document.createElement('form');
    form.action = `${STACKBLITZ_URL}?file=${indexFile}`;
    form.method = 'post';
    form.target = '_blank';
    return form;
  }

  /** Appends the name and value as an input to the form. */
  _appendFormInput(form: HTMLFormElement, name: string, value: string): void {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  /**
   * Reads the file and adds its text to the form
   * @param form the html form you are appending to
   * @param data example metadata about the example
   * @param filename file name of the example
   * @param path path to the src
   * @param prependApp whether to prepend the 'app' prefix to the path
   */
  _readFile(form: HTMLFormElement,
            data: ExampleData,
            filename: string,
            path: string,
            prependApp = true): void {
    this._http.get(path + filename, {responseType: 'text'}).subscribe(
      response => this._addFileToForm(form, data, response, filename, path, prependApp),
      error => console.log(error)
    );
  }

  /**
   * Adds the file text to the form.
   * @param form the html form you are appending to
   * @param data example metadata about the example
   * @param content file contents
   * @param filename file name of the example
   * @param path path to the src
   * @param prependApp whether to prepend the 'app' prefix to the path
   */
  _addFileToForm(form: HTMLFormElement,
                 data: ExampleData,
                 content: string,
                 filename: string,
                 path: string,
                 prependApp = true) {
    if (path == TEMPLATE_PATH) {
      content = this._replaceExamplePlaceholderNames(data, filename, content);
    } else if (prependApp) {
      filename = 'app/' + filename;
    }
    this._appendFormInput(form, `files[${filename}]`, this._appendCopyright(filename, content));
  }

  /**
   * The stackblitz template assets contain placeholder names for the examples:
   * "<material-docs-example>" and "MaterialDocsExample".
   * This will replace those placeholders with the names from the example metadata,
   * e.g. "<basic-button-example>" and "BasicButtonExample"
   */
  _replaceExamplePlaceholderNames(data: ExampleData,
                                  fileName: string,
                                  fileContent: string): string {
    if (fileName == 'index.html') {
      // Replace the component selector in `index,html`.
      // For example, <material-docs-example></material-docs-example> will be replaced as
      // <button-demo></button-demo>
      fileContent = fileContent.replace(/material-docs-example/g, data.selectorName);
      fileContent = fileContent.replace(/{{version}}/g, VERSION.full);
    } else if (fileName == 'main.ts') {
      // Replace the component name in `main.ts`.
      // Replace `import {MaterialDocsExample} from 'material-docs-example'`
      // will be replaced as `import {ButtonDemo} from './button-demo'`
      fileContent = fileContent.replace(/{MaterialDocsExample}/g, `{${data.componentName}}`);

      // Replace `declarations: [MaterialDocsExample]`
      // will be replaced as `declarations: [ButtonDemo]`
      fileContent = fileContent.
        replace(/declarations: \[MaterialDocsExample\]/g,
          `declarations: [${data.componentName}]`);

      // Replace `entryComponents: [MaterialDocsExample]`
      // will be replaced as `entryComponents: [DialogContent]`
      fileContent = fileContent.
        replace(/entryComponents: \[MaterialDocsExample\]/g,
          `entryComponents: [${data.componentName}]`);

      // Replace `bootstrap: [MaterialDocsExample]`
      // will be replaced as `bootstrap: [ButtonDemo]`
      // This assumes the first component listed in the main component
      const componentList = (data.componentName || '').split(',')[0];
      fileContent = fileContent.
        replace(/bootstrap: \[MaterialDocsExample\]/g,
          `bootstrap: [${componentList}]`);

      fileContent = fileContent.replace(/material-docs-example/g, data.indexFilename);
    }
    return fileContent;
  }

  _appendCopyright(filename: string, content: string) {
    if (filename.indexOf('.ts') > -1 || filename.indexOf('.scss') > -1) {
      content = `${content}\n\n/**  ${COPYRIGHT} */`;
    } else if (filename.indexOf('.html') > -1) {
      content = `${content}\n\n<!-- ${COPYRIGHT} -->`;
    }
    return content;
  }
}
