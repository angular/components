import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { ExampleData } from '../../examples/example-data';
import 'rxjs/add/operator/toPromise';

const PLUNKER_URL = 'https://plnkr.co/edit/?p=preview';

const COPYRIGHT =
  `Copyright 2016 Google Inc. All Rights Reserved.
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
  form: HTMLFormElement;
  exampleData: ExampleData;

  constructor(private _http: Http) {}

  /** Construct the plunker content */
  openPlunker(data: ExampleData) {
    this.exampleData = data;

    this.form = this._createFormElement();

    for (let i = 0; i < TAGS.length; i++) {
      this._createFormInput(`tags[${i}]`, TAGS[i]);
    }

    this._createFormInput('private', 'true');
    this._createFormInput('description', this.exampleData.description);

    var templateContents = TEMPLATE_FILES.map((file) => this._readFile(file, TEMPLATE_PATH));
    var exampleContents = this.exampleData.exampleFiles.map(
      (file) => this._readFile(file, this.exampleData.examplePath));

    Promise.all(templateContents.concat(exampleContents)).then((_) => this.form.submit());
  }

  _createFormElement(): HTMLFormElement {
    var form = document.createElement('form');
    form.action = PLUNKER_URL;
    form.method = 'post';
    form.target = '_blank';
    return form;
  }

  _createFormInput(name: string, value: string) {
    var input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    this.form.appendChild(input);
  }

  _readFile(filename: string, path: string) {
    return this._http.get(path + filename).toPromise().then(
      response => this._addFileToForm(response.text(), filename, path),
      error => console.log(error));
  }

  _addFileToForm(content: string, filename: string, path: string) {
    if (path == TEMPLATE_PATH) {
      content = this._replaceExamplePlaceholderNames(filename, content);
    }
    this._createFormInput(`files[${filename}]`, this._appendCopyright(filename, content));
  }

  /**
   * The Plunker template assets contain placeholder names for the examples:
   * "<material-docs-example>" and "MaterialDocsExample".
   * This will replace those placeholders with the names from the example metadata,
   * e.g. "<basic-button-example>" and "BasicButtonExample"
   */
  _replaceExamplePlaceholderNames(fileName: string, fileContent: string): string {
    if (fileName == 'index.html') {
      // Replace the component selector in `index,html`.
      // For example, <material-docs-example></material-docs-exmaple> will be replaced as
      // <button-demo></button-demo>
      fileContent = fileContent.replace(/material-docs-example/g, this.exampleData.selectorName);
    } else if (fileName == 'main.ts') {
      // Replace the component name in `main.ts`.
      // For example, `import {MaterialDocsExample} from 'material-docs-example'`
      // will be replaced as `import {ButtonDemo} from './button-demo'`
      fileContent = fileContent.replace(/MaterialDocsExample/g, this.exampleData.componentName);
      fileContent = fileContent.replace(/material-docs-example/g, this.exampleData.indexFilename);
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
