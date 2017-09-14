import {ReactiveFormsModule} from '@angular/forms';
import {async, inject, ComponentFixture, TestBed} from '@angular/core/testing';
import {MockBackend} from '@angular/http/testing';
import {Response, ResponseOptions} from '@angular/http';
import {By} from '@angular/platform-browser';

import {EXAMPLE_COMPONENTS} from '@angular/material-examples';
import {ExampleViewer} from './example-viewer';
import {DocsAppTestingModule} from '../../testing/testing-module';
import {DocViewerModule} from '../doc-viewer/doc-viewer-module';
import {FormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {
  MdAutocompleteModule,
  MdInputModule,
  MdSlideToggleModule
} from '@angular/material';
import {CopierService} from '../copier/copier.service';
import {MdSnackBar} from '@angular/material';

const exampleKey = 'autocomplete-overview';


describe('ExampleViewer', () => {
  let fixture: ComponentFixture<ExampleViewer>;
  let component: ExampleViewer;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        DocViewerModule,
        DocsAppTestingModule,
        ReactiveFormsModule,
        TestExampleModule
      ],
    }).compileComponents();
  }));

  beforeEach(inject([MockBackend], (mockBackend: MockBackend) => {
    // Mock backend request that may come through the doc viewer
    mockBackend.connections.subscribe((connection: any) => {
      const url = connection.request.url;
      connection.mockRespond(getFakeDocResponse(url));
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleViewer);
    component = fixture.componentInstance;
  });

  it('should toggle showSource boolean', () => {
    fixture.detectChanges();
    expect(component.showSource).toBe(false);
    component.toggleSourceView();
    expect(component.showSource).toBe(true);
  });

  it('should set and return example properly', () => {
    component.example = exampleKey;
    fixture.detectChanges();
    const data = component.exampleData;
    // TODO(jelbourn): remove `as any` once LiveExample is updated to have optional members.
    expect(data).toEqual(EXAMPLE_COMPONENTS[exampleKey] as any);
  });

  it('should log message about missing example', () => {
    spyOn(console, 'log');
    component.example = 'foobar';
    fixture.detectChanges();
    expect(console.log).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('MISSING EXAMPLE: ', 'foobar');
  });

  it('should return assets path for example based on extension', () => {
    // set example
    component.example = exampleKey;
    fixture.detectChanges();

    // get example file path for each extension
    const extensions = ['ts', 'css', 'html'];
    const basePath = '/assets/examples/';
    extensions.forEach(ext => {
      const expected = `${basePath}${exampleKey}-example-${ext}.html`;
      const actual = component.exampleFileUrl(ext);
      expect(actual).toEqual(expected);
    });
  });

  describe('copy button', () => {
    let button: HTMLElement;

    beforeEach(() => {
      // Open source view
      component.example = exampleKey;
      component.showSource = true;
      fixture.detectChanges();

      // Select button element
      const btnDe = fixture.debugElement.query(By.css('.docs-example-source-copy'));
      button = btnDe ? btnDe.nativeElement : null;
    });

    it('should call copier service when clicked', () => {
      const copierService: CopierService = TestBed.get(CopierService);
      const spy = spyOn(copierService, 'copyText');
      expect(spy.calls.count()).toBe(0, 'before click');
      button.click();
      expect(spy.calls.count()).toBe(1, 'after click');
      expect(spy.calls.argsFor(0)[0]).toBe('my docs page', 'click content');
    });

    it('should display a message when copy succeeds', () => {
      const snackBar: MdSnackBar = TestBed.get(MdSnackBar);
      const copierService: CopierService = TestBed.get(CopierService);
      spyOn(snackBar, 'open');
      spyOn(copierService, 'copyText').and.returnValue(true);
      button.click();
      expect(snackBar.open).toHaveBeenCalledWith('Code copied', '', {duration: 2500});
    });

    it('should display an error when copy fails', () => {
      const snackBar: MdSnackBar = TestBed.get(MdSnackBar);
      const copierService: CopierService = TestBed.get(CopierService);
      spyOn(snackBar, 'open');
      spyOn(copierService, 'copyText').and.returnValue(false);
      button.click();
      expect(snackBar.open)
          .toHaveBeenCalledWith('Copy failed. Please try again!', '', {duration: 2500});
    });
  });

});


// Create a version of ExampleModule for testing with only one component so that we don't have
// to compile all of the examples for these tests.
@NgModule({
  imports: [
    MdInputModule,
    MdAutocompleteModule,
    MdSlideToggleModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    NoopAnimationsModule
  ],
  declarations: [EXAMPLE_COMPONENTS[exampleKey].component],
  entryComponents: [EXAMPLE_COMPONENTS[exampleKey].component],
})
class TestExampleModule { }


const FAKE_DOCS = {
  '/assets/examples/autocomplete-overview-example-html.html':
      '<div>my docs page</div>',
  '/assets/examples/autocomplete-overview-example-ts.html':
      '<span>const a = 1;</span>',
  '/assets/examples/autocomplete-overview-example-css.html':
      '<pre>.class { color: black; }</pre>',
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
