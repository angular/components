import {HttpClient} from '@angular/common/http';
import {Injectable, NgZone} from '@angular/core';
import {VERSION} from '@angular/material/core';
import {EXAMPLE_COMPONENTS, ExampleData} from '@angular/components-examples';
import {Observable} from 'rxjs';
import {shareReplay, take} from 'rxjs/operators';

import {materialVersion} from '../version/version';

const STACKBLITZ_URL = 'https://run.stackblitz.com/api/angular/v1';

const COPYRIGHT =
  `Copyright ${new Date().getFullYear()} Google LLC. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at http://angular.io/license`;

/**
 * Path that refers to the docs-content from the "@angular/components-examples" package. The
 * structure is defined in the Material repository, but we include the docs-content as assets in
 * in the CLI configuration.
 */
const DOCS_CONTENT_PATH = '/docs-content/examples-source';

const TEMPLATE_PATH = '/assets/stack-blitz/';
const TEMPLATE_FILES = [
  '.editorconfig',
  '.gitignore',
  'angular.json',
  '.browserslistrc',
  'package.json',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.spec.json',
  'src/index.html',
  'src/styles.scss',
  'src/polyfills.ts',
  'src/main.ts',
  'src/app/material-module.ts'
];

const TEST_TEMPLATE_PATH = '/assets/stack-blitz-tests/';
const TEST_TEMPLATE_FILES = [
  '.editorconfig',
  '.gitignore',
  'angular.json',
  '.browserslistrc',
  'package.json',
  'src/test.ts',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.spec.json',
  'src/index.html',
  'src/styles.scss',
  'src/polyfills.ts',
  'src/main.ts',
  'src/test/jasmine-setup.ts'
];

const TAGS: string[] = ['angular', 'material', 'example'];
const angularVersion = '^12.0.0';

const dependencies = {
  '@angular/cdk': materialVersion,
  '@angular/animations': angularVersion,
  '@angular/common': angularVersion,
  '@angular/compiler': angularVersion,
  '@angular/core': angularVersion,
  '@angular/forms': angularVersion,
  '@angular/material': materialVersion,
  '@angular/material-moment-adapter': materialVersion,
  '@angular/platform-browser': angularVersion,
  '@angular/platform-browser-dynamic': angularVersion,
  '@angular/router': angularVersion,
  'moment': '^2.29.1',
  'rxjs': '^6.6.7',
  'tslib': '^2.2.0',
  'zone.js': '^0.11.4',
};

const testDependencies = {
  '@angular/cdk': materialVersion,
  '@angular/animations': angularVersion,
  '@angular/common': angularVersion,
  '@angular/compiler': angularVersion,
  '@angular/core': angularVersion,
  '@angular/forms': angularVersion,
  '@angular/material': materialVersion,
  '@angular/material-moment-adapter': materialVersion,
  '@angular/platform-browser': angularVersion,
  '@angular/platform-browser-dynamic': angularVersion,
  '@angular/router': angularVersion,
  '@types/jasmine': '^3.7.7',
  'jasmine-core': '^3.7.1',
  'moment': '^2.29.1',
  'rxjs': '^6.6.7',
  'tslib': '^2.2.0',
  'zone.js': '^0.11.4',
};

/**
 * StackBlitz writer, write example files to StackBlitz.
 *
 * StackBlitz API
 * URL: https://run.stackblitz.com/api/aio/v1/
 * data: {
 *   // File name, directory and content of files
 *   files[file-name1]: file-content1,
 *   files[directory-name/file-name2]: file-content2,
 *   // Can add multiple tags
 *   tags[0]: tag-0,
 *   // Description of StackBlitz
 *   description: description,
 *   // Private or not
 *   private: true
 *  // Dependencies
 *  dependencies: dependencies
 * }
 */
@Injectable({providedIn: 'root'})
export class StackBlitzWriter {
  private _fileCache = new Map<string, Observable<string>>();

  constructor(private _http: HttpClient, private _ngZone: NgZone) {}

  /**
   * Returns an HTMLFormElement that will open a new StackBlitz template with the example data when
   * called with submit().
   */
  async constructStackBlitzForm(exampleId: string, data: ExampleData,
                                isTest: boolean): Promise<HTMLFormElement> {
    const liveExample = EXAMPLE_COMPONENTS[exampleId];
    const indexFile = `src%2Fapp%2F${data.indexFilename}`;
    const form = this._createFormElement(indexFile);
    const baseExamplePath =
      `${DOCS_CONTENT_PATH}/${liveExample.module.importSpecifier}/${exampleId}/`;

    TAGS.forEach((tag, i) => this._appendFormInput(form, `tags[${i}]`, tag));
    this._appendFormInput(form, 'private', 'true');
    this._appendFormInput(form, 'description', data.description);
    this._appendFormInput(form,
      'dependencies',
      JSON.stringify(isTest ? testDependencies : dependencies));

    // Run outside the zone since this form doesn't interact with Angular
    // and the file requests can cause excessive change detections.
    await this._ngZone.runOutsideAngular(() => {
      const fileReadPromises: Promise<void>[] = [];

      // Read all of the template files.
      (isTest ? TEST_TEMPLATE_FILES : TEMPLATE_FILES).forEach(file => fileReadPromises.push(
        this._loadAndAppendFile(form, data, file, isTest ? TEST_TEMPLATE_PATH : TEMPLATE_PATH,
          isTest)));

      // Read the example-specific files.
      data.exampleFiles.forEach(file => fileReadPromises.push(this._loadAndAppendFile(form, data,
        file, baseExamplePath, isTest)));

      // TODO(josephperrott): Prevent including assets to be manually checked.
      if (data.selectorName === 'icon-svg-example') {
        fileReadPromises.push(this._loadAndAppendFile(form, data,
          'assets/img/examples/thumbup-icon.svg', '', isTest, false));
      }

      return Promise.all(fileReadPromises);
    });

    return form;
  }

  /** Constructs a new form element that will navigate to the StackBlitz url. */
  _createFormElement(indexFile: string): HTMLFormElement {
    const form = document.createElement('form');
    form.action = `${STACKBLITZ_URL}?file=${indexFile}`;
    form.method = 'post';
    form.target = '_blank';
    return form;
  }

  /** Appends the name and value as an input to the form. */
  private _appendFormInput(form: HTMLFormElement, name: string, value: string): void {
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
   * @param isTest whether file is part of a test example
   * @param prependApp whether to prepend the 'app' prefix to the path
   */
  private _loadAndAppendFile(form: HTMLFormElement, data: ExampleData, filename: string,
                            path: string, isTest: boolean, prependApp = true): Promise<void> {
    const url = path + filename;
    let stream = this._fileCache.get(url);

    if (!stream) {
      stream = this._http.get(url, {responseType: 'text'}).pipe(shareReplay(1));
      this._fileCache.set(url, stream);
    }

    // The `take(1)` is necessary, because the Promise from `toPromise` resolves on complete.
    return stream.pipe(take(1)).toPromise().then(
      response => this._addFileToForm(form, data, response, filename, path, isTest, prependApp),
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
   * @param isTest whether file is part of a test example
   * @param prependApp whether to prepend the 'app' prefix to the path
   */
  _addFileToForm(form: HTMLFormElement,
                 data: ExampleData,
                 content: string,
                 filename: string,
                 path: string,
                 isTest: boolean,
                 prependApp = true) {
    if (path === (isTest ? TEST_TEMPLATE_PATH : TEMPLATE_PATH)) {
      content = this._replaceExamplePlaceholderNames(data, filename, content);
    } else if (prependApp) {
      filename = 'src/app/' + filename;
    }
    this._appendFormInput(form, `files[${filename}]`, this._appendCopyright(filename, content));
  }

  /**
   * The StackBlitz template assets contain placeholder names for the examples:
   * "<material-docs-example>" and "MaterialDocsExample".
   * This will replace those placeholders with the names from the example metadata,
   * e.g. "<basic-button-example>" and "BasicButtonExample"
   */
  private _replaceExamplePlaceholderNames(data: ExampleData,
                                          fileName: string,
                                          fileContent: string): string {
    if (fileName === 'src/index.html') {
      // Replace the component selector in `index,html`.
      // For example, <material-docs-example></material-docs-example> will be replaced as
      // <button-demo></button-demo>
      fileContent = fileContent
        .replace(/material-docs-example/g, data.selectorName)
        .replace(/{{title}}/g, data.description)
        .replace(/{{version}}/g, VERSION.full);
    } else if (fileName === 'src/main.ts') {
      const joinedComponentNames = data.componentNames.join(', ');
      // Replace the component name in `main.ts`.
      // Replace `import {MaterialDocsExample} from 'material-docs-example'`
      // will be replaced as `import {ButtonDemo} from './button-demo'`
      fileContent = fileContent.replace(/{MaterialDocsExample}/g, `{${joinedComponentNames}}`);

      // Replace `declarations: [MaterialDocsExample]`
      // will be replaced as `declarations: [ButtonDemo]`
      fileContent = fileContent.
        replace(/declarations: \[MaterialDocsExample]/g,
          `declarations: [${joinedComponentNames}]`);

      // Replace `entryComponents: [MaterialDocsExample]`
      // will be replaced as `entryComponents: [DialogContent]`
      fileContent = fileContent.
        replace(/entryComponents: \[MaterialDocsExample]/g,
          `entryComponents: [${joinedComponentNames}]`);

      // Replace `bootstrap: [MaterialDocsExample]`
      // will be replaced as `bootstrap: [ButtonDemo]`
      // This assumes the first component listed in the main component
      fileContent = fileContent.
        replace(/bootstrap: \[MaterialDocsExample]/g,
          `bootstrap: [${data.componentNames[0]}]`);

      const dotIndex = data.indexFilename.lastIndexOf('.');
      const importFileName = data.indexFilename.slice(0, dotIndex === -1 ? undefined : dotIndex);
      fileContent = fileContent.replace(/material-docs-example/g, importFileName);

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
