import {Component} from '@angular/core';
import {async, inject, TestBed} from '@angular/core/testing';
import {MockBackend} from '@angular/http/testing';
import {Response, ResponseOptions} from '@angular/http';
import {By} from '@angular/platform-browser';
import {DocViewer} from './doc-viewer';
import {DocsAppTestingModule} from '../../testing/testing-module';
import {DocViewerModule} from './doc-viewer-module';


describe('DocViewer', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DocViewerModule, DocsAppTestingModule],
      declarations: [DocViewerTestComponent],
    }).compileComponents();
  }));

  beforeEach(inject([MockBackend], (mockBackend: MockBackend) => {
    mockBackend.connections.subscribe((connection: any) => {
      const url = connection.request.url;
      connection.mockRespond(getFakeDocResponse(url));
    });
  }));

  it('should load doc into innerHTML', () => {
    let fixture = TestBed.createComponent(DocViewerTestComponent);
    fixture.detectChanges();

    let docViewer = fixture.debugElement.query(By.directive(DocViewer));
    expect(docViewer).not.toBeNull();
    expect(docViewer.nativeElement.innerHTML).toBe('<div>my docs page</div>');
  });

  it('should show error message when doc not found', () => {
    let fixture = TestBed.createComponent(DocViewerTestComponent);
    fixture.detectChanges();

    fixture.componentInstance.documentUrl = 'http://material.angular.io/error-doc.html';
    fixture.detectChanges();

    let docViewer = fixture.debugElement.query(By.directive(DocViewer));
    expect(docViewer).not.toBeNull();
    expect(docViewer.nativeElement.innerHTML).toContain(
        'Failed to load document: http://material.angular.io/error-doc.html');
  });

  // TODO(mmalerba): Add test that example-viewer is instantiated.
});

@Component({
  selector: 'test',
  template: `<doc-viewer [documentUrl]="documentUrl"></doc-viewer>`,
})
class DocViewerTestComponent {
  documentUrl = 'http://material.angular.io/simple-doc.html';
}

const FAKE_DOCS = {
  'http://material.angular.io/simple-doc.html': '<div>my docs page</div>',
  'http://material.angular.io/doc-with-example.html': `
      <div>Check out this example:</div>
      <div material-docs-example="some-example"></div>`,
};

function getFakeDocResponse(url: string) {
  if (url in FAKE_DOCS) {
    return new Response(new ResponseOptions({
      status: 200,
      body: FAKE_DOCS[url],
    }));
  } else {
    return new Response(new ResponseOptions({status: 404}));
  }
}
