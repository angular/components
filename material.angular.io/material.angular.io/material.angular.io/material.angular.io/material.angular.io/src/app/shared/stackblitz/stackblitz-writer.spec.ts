import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {async, fakeAsync, flushMicrotasks, inject, TestBed} from '@angular/core/testing';
import {ExampleData} from '@angular/material-examples';
import {StackblitzWriter} from './stackblitz-writer';


describe('StackblitzWriter', () => {
  let stackblitzWriter: StackblitzWriter;
  let data: ExampleData;
  let http: HttpTestingController;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [],
      providers: [
        StackblitzWriter,
      ]
    }).compileComponents();
  }));

  beforeEach(inject([HttpTestingController], (h: HttpTestingController) => {
    http = h;
  }));

  beforeEach(() => {
    stackblitzWriter = TestBed.get(StackblitzWriter);
    data = new ExampleData('');
    data.examplePath = 'http://material.angular.io/';
    data.exampleFiles = ['test.ts', 'test.html', 'src/detail.ts'];
  });

  it('should append correct copyright', () => {
    expect(stackblitzWriter._appendCopyright('test.ts', 'NoContent')).toBe(`NoContent

/**  Copyright 2018 Google Inc. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at http://angular.io/license */`);

    expect(stackblitzWriter._appendCopyright('test.html', 'NoContent')).toBe(`NoContent

<!-- Copyright 2018 Google Inc. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at http://angular.io/license -->`);

  });

  it('should create form element', () => {
    expect(stackblitzWriter._createFormElement('index.ts').outerHTML).toBe(
      `<form action="https://run.stackblitz.com/api/angular/v1?file=index.ts" ` +
      `method="post" target="_blank"></form>`);
  });

  it('should add files to form input', () => {
    let form = stackblitzWriter._createFormElement('index.ts');

    stackblitzWriter._addFileToForm(form, data, 'NoContent', 'test.ts', 'path/to/file');
    stackblitzWriter._addFileToForm(form, data, 'Test', 'test.html', 'path/to/file');
    stackblitzWriter._addFileToForm(form, data, 'Detail', 'src/detail.ts', 'path/to/file');

    expect(form.elements.length).toBe(3);
    expect(form.elements[0].getAttribute('name')).toBe('files[app/test.ts]');
    expect(form.elements[1].getAttribute('name')).toBe('files[app/test.html]');
    expect(form.elements[2].getAttribute('name')).toBe('files[app/src/detail.ts]');
  });

  it('should open a new window with stackblitz url', fakeAsync(() => {
    let form;
    stackblitzWriter.constructStackblitzForm(data).then(result => form = result);
    flushMicrotasks();

    for (const url of TEST_URLS) {
      http.expectOne(url).flush(FAKE_DOCS[url] || '');
    }
    flushMicrotasks();

    expect(form.elements.length).toBe(15);

    // Should have correct tags
    expect(form.elements[0].getAttribute('name')).toBe('tags[0]');
    expect(form.elements[0].getAttribute('value')).toBe('angular');
    expect(form.elements[1].getAttribute('name')).toBe('tags[1]');
    expect(form.elements[1].getAttribute('value')).toBe('material');
    expect(form.elements[2].getAttribute('name')).toBe('tags[2]');
    expect(form.elements[2].getAttribute('value')).toBe('example');

    // Should bet set as private and have description and dependencies.
    expect(form.elements[3].getAttribute('name')).toBe('private');
    expect(form.elements[3].getAttribute('value')).toBe('true');
    expect(form.elements[4].getAttribute('name')).toBe('description');
    expect(form.elements[5].getAttribute('name')).toBe('dependencies');

    // Should have files needed for example.
    expect(form.elements[6].getAttribute('name')).toBe('files[index.html]');
    expect(form.elements[7].getAttribute('name')).toBe('files[styles.css]');
    expect(form.elements[8].getAttribute('name')).toBe('files[polyfills.ts]');
    expect(form.elements[9].getAttribute('name')).toBe('files[.angular-cli.json]');
    expect(form.elements[10].getAttribute('name')).toBe('files[main.ts]');
    expect(form.elements[11].getAttribute('name')).toBe('files[material-module.ts]');
    expect(form.elements[12].getAttribute('name')).toBe('files[app/test.ts]');
    expect(form.elements[13].getAttribute('name')).toBe('files[app/test.html]');
    expect(form.elements[14].getAttribute('name')).toBe('files[app/src/detail.ts]');
  }));
});

const FAKE_DOCS = {
  'http://material.angular.io/test.ts': 'ExampleComponent',
  'http://material.angular.io/test.html': `
      <example></example>`,
  'http://material.angular.io/src/detail.ts': 'DetailComponent',
};

const TEST_URLS = [
  '/assets/stackblitz/index.html',
  '/assets/stackblitz/styles.css',
  '/assets/stackblitz/polyfills.ts',
  '/assets/stackblitz/.angular-cli.json',
  '/assets/stackblitz/main.ts',
  '/assets/stackblitz/material-module.ts',
  'http://material.angular.io/test.ts',
  'http://material.angular.io/test.html',
  'http://material.angular.io/src/detail.ts',
];
