import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { ExampleData } from '../../examples/example-data';
import 'rxjs/add/operator/toPromise';

const PLUNKER_URL = 'https://plnkr.co/edit/?p=preview';

const COPYRIGHT =
  `Copyright 2017 Google Inc. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at http://angular.io/license`;

const TEMPLATE_PATH = '/assets/plunker/';
const TEMPLATE_FILES = ['index.html', 'systemjs.config.js', 'main.ts'];

const TAGS: string[] = ['angular', 'material', 'example'];

/**
 * Plunker writer, write example files to Plunker
 *
 * Plunker API
 * URL: http://plnkr.co/edit/?p=preview
 * data: {
 *   // File name, directory and content of files
 *   files[file-name1]: file-content1,
 *   files[directory-name/file-name2]: file-content2,
 *   // Can add multiple tags
 *   tags[0]: tag-0,
 *   // Description of plunker
 *   description: description,
 *   // Private or not
 *   private: true
 * }
 */
@Injectable()
export class PlunkerWriter {
  constructor(private _http: Http) {}

  /**
   * Returns an HTMLFormElement that will open a new plunker template with the example data when
   * called with submit().
   */
  constructPlunkerForm(data: ExampleData): Promise<HTMLFormElement> {
    let form = this._createFormElement();

    TAGS.forEach((tag, i) => this._appendFormInput(form, `tags[${i}]`, tag));
    this._appendFormInput(form, 'private', 'true');
    this._appendFormInput(form, 'description', data.description);

    return new Promise(resolve => {
      let templateContents = TEMPLATE_FILES
          .map(file => this._readFile(form, data, file, TEMPLATE_PATH));

      let exampleContents = data.exampleFiles
          .map(file => this._readFile(form, data, file, data.examplePath));

      Promise.all(templateContents.concat(exampleContents)).then(() => {
        resolve(form);
      });
    });
  }

  /** Constructs a new form element that will navigate to the plunker url. */
  _createFormElement(): HTMLFormElement {
    const form = document.createElement('form');
    form.action = PLUNKER_URL;
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

  /** Reads the file and adds its text to the form */
  _readFile(form: HTMLFormElement, data: ExampleData, filename: string, path: string): void {
    this._http.get(path + filename).toPromise().then(
      response => this._addFileToForm(form, data, response.text(), filename, path),
      error => console.log(error));
  }

  /** Adds the file text to the form. */
  _addFileToForm(form: HTMLFormElement,
                 data: ExampleData,
                 content: string,
                 filename: string,
                 path: string) {
    if (path == TEMPLATE_PATH) {
      content = this._replaceExamplePlaceholderNames(data, filename, content);
    }
    this._appendFormInput(form, `files[${filename}]`, this._appendCopyright(filename, content));
  }

  /**
   * The Plunker template assets contain placeholder names for the examples:
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
    } else if (fileName == 'main.ts') {
      // Replace the component name in `main.ts`.
      // For example, `import {MaterialDocsExample} from 'material-docs-example'`
      // will be replaced as `import {ButtonDemo} from './button-demo'`
      fileContent = fileContent.replace(/MaterialDocsExample/g, data.componentName);
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
