import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {waitForAsync, fakeAsync, flushMicrotasks, inject, TestBed} from '@angular/core/testing';
import {EXAMPLE_COMPONENTS, ExampleData, LiveExample} from '@angular/components-examples';
import {StackBlitzWriter} from './stack-blitz-writer';

const testExampleId = 'my-test-example-id';

describe('StackBlitzWriter', () => {
  let stackBlitzWriter: StackBlitzWriter;
  let data: ExampleData;
  let http: HttpTestingController;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [],
      providers: [
        StackBlitzWriter,
      ]
    }).compileComponents();
  }));

  beforeEach(inject([HttpTestingController], (h: HttpTestingController) => {
    http = h;
  }));

  beforeEach(() => {
    stackBlitzWriter = TestBed.inject(StackBlitzWriter);
    data = new ExampleData('');
    data.componentNames = [];
    data.exampleFiles = ['test.ts', 'test.html', 'src/detail.ts'];
    data.indexFilename = data.exampleFiles[0];

    // Fake the example in the `EXAMPLE_COMPONENTS`. The stack blitz writer relies on
    // module information for the example in order to read the example sources from disk.
    EXAMPLE_COMPONENTS[testExampleId] = {module: {importSpecifier: 'cdk/my-comp'}} as LiveExample;
  });

  afterEach(() => {
    delete EXAMPLE_COMPONENTS[testExampleId];
  });

  it('should append correct copyright', () => {
    expect(stackBlitzWriter._appendCopyright('test.ts', 'NoContent')).toBe(`NoContent

/**  Copyright 2020 Google LLC. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at http://angular.io/license */`);

    expect(stackBlitzWriter._appendCopyright('test.html', 'NoContent')).toBe(`NoContent

<!-- Copyright 2020 Google LLC. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at http://angular.io/license -->`);

  });

  it('should create form element', () => {
    expect(stackBlitzWriter._createFormElement('index.ts').outerHTML).toBe(
      `<form action="https://run.stackblitz.com/api/angular/v1?file=index.ts" ` +
      `method="post" target="_blank"></form>`);
  });

  it('should add files to form input', () => {
    const form = stackBlitzWriter._createFormElement('index.ts');

    stackBlitzWriter._addFileToForm(form, data, 'NoContent', 'test.ts', 'path/to/file', false);
    stackBlitzWriter._addFileToForm(form, data, 'Test', 'test.html', 'path/to/file', false);
    stackBlitzWriter._addFileToForm(form, data, 'Detail', 'src/detail.ts', 'path/to/file', false);

    expect(form.elements.length).toBe(3);
    expect(form.elements[0].getAttribute('name')).toBe('files[src/app/test.ts]');
    expect(form.elements[1].getAttribute('name')).toBe('files[src/app/test.html]');
    expect(form.elements[2].getAttribute('name')).toBe('files[src/app/src/detail.ts]');
  });

  it('should open a new window with stackblitz url', fakeAsync(() => {
    let form: HTMLFormElement;
    stackBlitzWriter.constructStackBlitzForm(testExampleId, data, false).then(result => {
      form = result;
      flushMicrotasks();

      for (const url of TEST_URLS) {
        http.expectOne(url).flush(FAKE_DOCS[url] || '');
      }
      flushMicrotasks();

      expect(form.elements.length).toBe(14);

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
      expect(form.elements[6].getAttribute('name')).toBe('files[src/index.html]');
      expect(form.elements[7].getAttribute('name')).toBe('files[src/styles.scss]');
      expect(form.elements[8].getAttribute('name')).toBe('files[src/polyfills.ts]');
      expect(form.elements[9].getAttribute('name')).toBe('files[src/main.ts]');
      expect(form.elements[10].getAttribute('name')).toBe('files[src/app/material-module.ts]');
      expect(form.elements[11].getAttribute('name')).toBe('files[src/app/test.ts]');
      expect(form.elements[12].getAttribute('name')).toBe('files[src/app/test.html]');
      expect(form.elements[13].getAttribute('name')).toBe('files[src/app/src/detail.ts]');
    });
  }));
});

const FAKE_DOCS: {[key: string]: string} = {
  '/docs-content/examples-source/test.ts': 'ExampleComponent',
  '/docs-content/examples-source/test.html': `<example></example>`,
  '/docs-content/examples-source/src/detail.ts': 'DetailComponent',
};

const TEST_URLS = [
  '/assets/stack-blitz/src/index.html',
  '/assets/stack-blitz/src/styles.scss',
  '/assets/stack-blitz/src/polyfills.ts',
  '/assets/stack-blitz/src/main.ts',
  '/assets/stack-blitz/src/app/material-module.ts',
  `/docs-content/examples-source/cdk/my-comp/${testExampleId}/test.ts`,
  `/docs-content/examples-source/cdk/my-comp/${testExampleId}/test.html`,
  `/docs-content/examples-source/cdk/my-comp/${testExampleId}/src/detail.ts`,
];
