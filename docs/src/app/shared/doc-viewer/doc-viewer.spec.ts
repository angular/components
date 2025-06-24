import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {DocViewer} from './doc-viewer';
import {ExampleViewer} from '../example-viewer/example-viewer';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIconButton} from '@angular/material/button';
import {Clipboard} from '@angular/cdk/clipboard';
import {provideHttpClient} from '@angular/common/http';
import {provideRouter} from '@angular/router';

describe('DocViewer', () => {
  let http: HttpTestingController;
  const clipboardSpy = jasmine.createSpyObj<Clipboard>('Clipboard', ['copy']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DocViewerTestComponent],
      providers: [
        {provide: Clipboard, useValue: clipboardSpy},
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpTestingController);
  });

  it('should load doc into innerHTML', () => {
    const fixture = TestBed.createComponent(DocViewerTestComponent);
    fixture.detectChanges();

    const url = fixture.componentInstance.documentUrl;
    http.expectOne(url).flush(FAKE_DOCS[url]);

    const docViewer = fixture.debugElement.query(By.directive(DocViewer));
    expect(docViewer).not.toBeNull();
    expect(docViewer.nativeElement.innerHTML).toBe('<div>my docs page</div>');
  });

  it('should load component', () => {
    const fixture = TestBed.createComponent(DocViewerWithCompTestComponent);
    fixture.detectChanges();

    const docViewer = fixture.debugElement.query(By.directive(DocViewer));
    expect(docViewer).not.toBeNull();
    expect(docViewer.nativeElement.innerHTML).toContain(`TEST_COMPONENT_GUIDE`);
  });

  it('should save textContent of the doc', () => {
    const fixture = TestBed.createComponent(DocViewerTestComponent);
    fixture.detectChanges();

    const url = fixture.componentInstance.documentUrl;
    http.expectOne(url).flush(FAKE_DOCS[url]);

    const docViewer = fixture.debugElement.query(By.directive(DocViewer));
    expect(docViewer.componentInstance.textContent).toBe('my docs page');
  });

  it('should correct hash based links', () => {
    const fixture = TestBed.createComponent(DocViewerTestComponent);
    fixture.componentInstance.documentUrl = `http://material.angular.dev/doc-with-links.html`;
    fixture.detectChanges();

    const url = fixture.componentInstance.documentUrl;
    http.expectOne(url).flush(FAKE_DOCS[url]);

    const docViewer = fixture.debugElement.query(By.directive(DocViewer));
    // Our test runner runs at the page /context.html, so it will be the prepended value.
    expect(docViewer.nativeElement.innerHTML).toContain(`/context.html#test"`);
  });

  it('should preserve document element ids', () => {
    const fixture = TestBed.createComponent(DocViewerTestComponent);
    const testUrl = 'http://material.angular.dev/doc-with-element-ids.html';

    fixture.componentInstance.documentUrl = testUrl;
    fixture.detectChanges();

    http.expectOne(testUrl).flush(FAKE_DOCS[testUrl]);

    const docViewer = fixture.debugElement.query(By.directive(DocViewer));
    expect(docViewer.nativeElement.innerHTML).toContain('id="my-header"');
  });

  it('should instantiate example viewer in snippet view with region', () => {
    const fixture = TestBed.createComponent(DocViewerTestComponent);
    const testUrl = 'http://material.angular.dev/snippet-example.html';

    fixture.componentInstance.documentUrl = testUrl;
    fixture.detectChanges();

    http.expectOne(testUrl).flush(FAKE_DOCS[testUrl]);

    const exampleViewer = fixture.debugElement.query(By.directive(ExampleViewer))
      .componentInstance as ExampleViewer;
    expect(exampleViewer.file()).toBe('some-example.html');
    expect(exampleViewer.showCompactToggle()).toBeTrue();
    expect(exampleViewer.region()).toBe('some-region');
    expect(exampleViewer.view()).toBe('snippet');
  });

  it('should instantiate example viewer in demo view', () => {
    const fixture = TestBed.createComponent(DocViewerTestComponent);
    const testUrl = 'http://material.angular.dev/demo-example.html';

    fixture.componentInstance.documentUrl = testUrl;
    fixture.detectChanges();

    http.expectOne(testUrl).flush(FAKE_DOCS[testUrl]);

    const exampleViewer = fixture.debugElement.query(By.directive(ExampleViewer))
      .componentInstance as ExampleViewer;
    expect(exampleViewer.file()).toBeUndefined();
    expect(exampleViewer.showCompactToggle()).toBeFalse();
    expect(exampleViewer.view()).toBe('demo');
  });

  it('should instantiate example viewer in snippet view with whole snippet', () => {
    const fixture = TestBed.createComponent(DocViewerTestComponent);
    const testUrl = 'http://material.angular.dev/whole-snippet-example.html';

    fixture.componentInstance.documentUrl = testUrl;
    fixture.detectChanges();

    http.expectOne(testUrl).flush(FAKE_DOCS[testUrl]);

    const exampleViewer = fixture.debugElement.query(By.directive(ExampleViewer))
      .componentInstance as ExampleViewer;
    expect(exampleViewer.file()).toBe('whole-snippet-example.ts');
    expect(exampleViewer.showCompactToggle()).toBeTrue();
    expect(exampleViewer.view()).toBe('snippet');
  });

  it('should show error message when doc not found', () => {
    spyOn(console, 'error');

    const fixture = TestBed.createComponent(DocViewerTestComponent);
    const docViewer = fixture.debugElement.query(By.directive(DocViewer));
    fixture.detectChanges();

    const url = fixture.componentInstance.documentUrl;
    http.expectOne(url).flush(FAKE_DOCS[url]);

    const errorUrl = 'http://material.angular.dev/error-doc.html';

    fixture.componentInstance.documentUrl = errorUrl;
    fixture.detectChanges();

    http.expectOne(errorUrl).flush('Not found', {status: 404, statusText: 'Not found'});

    expect(docViewer).not.toBeNull();
    expect(docViewer.nativeElement.innerHTML).toContain(
      'Failed to load document: http://material.angular.dev/error-doc.html',
    );
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it('should show tooltip for deprecated symbol', () => {
    const fixture = TestBed.createComponent(DocViewerTestComponent);
    fixture.componentInstance.documentUrl = `http://material.angular.dev/deprecated.html`;
    fixture.detectChanges();

    const url = fixture.componentInstance.documentUrl;
    http.expectOne(url).flush(FAKE_DOCS[url]);

    const docViewer = fixture.debugElement.query(By.directive(DocViewer));

    expect(docViewer).not.toBeNull();

    // we have five deprecated symbols: class, constant, type alias, interface
    // and properties.
    expect(docViewer.children.length).toBe(5);

    // it should have "Deprecated" as its inner text
    const deprecatedSymbol = docViewer.children.shift()!;
    expect(deprecatedSymbol.nativeElement.innerText).toBe('Deprecated');

    // should contain the tooltip component
    const tooltipElement = deprecatedSymbol.children.shift()!;
    expect(tooltipElement.nativeElement).toBeTruthy();

    // should show tooltip on hovering the element
    tooltipElement.nativeNode.dispatchEvent(new MouseEvent('hover'));
    fixture.detectChanges();
    expect(deprecatedSymbol.query(By.directive(MatTooltip))).toBeTruthy();
  });

  it('should show copy icon button for module imports', () => {
    const fixture = TestBed.createComponent(DocViewerTestComponent);
    fixture.componentInstance.documentUrl = `http://material.angular.dev/copy-module-import.html`;
    fixture.detectChanges();

    const url = fixture.componentInstance.documentUrl;
    http.expectOne(url).flush(FAKE_DOCS[url]);

    const docViewer = fixture.debugElement.query(By.directive(DocViewer));
    expect(docViewer).not.toBeNull();

    const iconButton = fixture.debugElement.query(By.directive(MatIconButton));
    // icon button for copying module import should exist
    expect(iconButton).toBeTruthy();

    // click on icon button to trigger copying the module import
    iconButton.nativeNode.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();
    expect(clipboardSpy.copy).toHaveBeenCalled();
  });

  // TODO(mmalerba): Add test that example-viewer is instantiated.
});

@Component({
  selector: 'test',
  template: `<doc-viewer [document]="documentUrl"></doc-viewer>`,
  imports: [DocViewer],
})
class DocViewerTestComponent {
  documentUrl = 'http://material.angular.dev/simple-doc.html';
}

const FAKE_DOCS: {[key: string]: string} = {
  'http://material.angular.dev/simple-doc.html': '<div>my docs page</div>',
  'http://material.angular.dev/doc-with-example.html': `
      <div>Check out this example:</div>
      <div material-docs-example="some-example"></div>`,
  'http://material.angular.dev/doc-with-links.html': `<a href="#test">Test link</a>`,
  'http://material.angular.dev/doc-with-element-ids.html': `<h4 id="my-header">Header</h4>`,
  'http://material.angular.dev/snippet-example.html':
    '<div material-docs-example="some-example" file="some-example.html"' +
    ' region="some-region"></div>',
  'http://material.angular.dev/demo-example.html':
    '<div material-docs-example="demo-example"></div>',
  'http://material.angular.dev/whole-snippet-example.html':
    '<div material-docs-example="whole-snippet-example" file="whole-snippet-example.ts"></div>',
  'http://material.angular.dev/deprecated.html': `<div class="docs-api-class-deprecated-marker"
        deprecated-message="deprecated class">Deprecated</div>

      <div class="docs-api-constant-deprecated-marker"
        deprecated-message="deprecated constant">Deprecated</div>

      <div class="docs-api-interface-deprecated-marker"
        deprecated-message="deprecated interface">Deprecated</div>

      <div class="docs-api-type-alias-deprecated-marker"
        deprecated-message="deprecated type alias">Deprecated</div>

      <div class="docs-api-deprecated-marker"
        deprecated-message="deprecated">Deprecated</div>`,
  'http://material.angular.dev/copy-module-import.html': `<div class="docs-api-module">
      <p class="docs-api-module-import">
        <code>
          import {MatIconModule} from '@angular/material/icon';
        </code>
      </p>

      <div class="docs-api-module-import-button"
        data-docs-api-module-import-button="import {MatIconModule} from '@angular/material/icon';">
      </div>
    </div>`,
};

@Component({
  template: `TEST_COMPONENT_GUIDE`,
})
class TestComponent {}

@Component({
  selector: 'test',
  template: `<doc-viewer [document]="component"></doc-viewer>`,
  imports: [DocViewer, TestComponent],
})
class DocViewerWithCompTestComponent {
  component = TestComponent;
}
