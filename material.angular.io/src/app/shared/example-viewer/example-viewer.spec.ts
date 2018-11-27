import {CommonModule} from '@angular/common';
import {HttpTestingController} from '@angular/common/http/testing';
import {NgModule} from '@angular/core';
import {async, ComponentFixture, inject, TestBed} from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatInputModule,
  MatSlideToggleModule,
  MatSnackBar,
} from '@angular/material';

import {EXAMPLE_COMPONENTS} from '@angular/material-examples';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {DocsAppTestingModule} from '../../testing/testing-module';
import {CopierService} from '../copier/copier.service';
import {DocViewerModule} from '../doc-viewer/doc-viewer-module';
import {ExampleViewer} from './example-viewer';

const exampleKey = 'autocomplete-overview';


describe('ExampleViewer', () => {
  let fixture: ComponentFixture<ExampleViewer>;
  let component: ExampleViewer;
  let http: HttpTestingController;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        DocViewerModule,
        DocsAppTestingModule,
        ReactiveFormsModule,
        TestExampleModule,
      ],
    }).compileComponents();
  }));

  beforeEach(inject([HttpTestingController], (h: HttpTestingController) => {
    http = h;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleViewer);
    component = fixture.componentInstance;
  });

  it('should toggle showSource boolean', async(() => {
    fixture.detectChanges();
    expect(component.showSource).toBe(false);
    component.toggleSourceView();
    expect(component.showSource).toBe(true);
  }));

  it('should set and return example properly', async(() => {
    component.example = exampleKey;
    fixture.detectChanges();
    const data = component.exampleData;
    // TODO(jelbourn): remove `as any` once LiveExample is updated to have optional members.
    expect(data).toEqual(EXAMPLE_COMPONENTS[exampleKey] as any);
  }));

  it('should print an error message about missing example', async(() => {
    spyOn(console, 'error');
    component.example = 'foobar';
    fixture.detectChanges();
    expect(console.error).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Could not find example: foobar');
  }));

  it('should return assets path for example based on extension', async(() => {
    // set example
    component.example = exampleKey;
    fixture.detectChanges();

    // get example file path for each extension
    const extensions = ['ts', 'css', 'html'];
    const basePath = '/assets/examples/';

    extensions.forEach(extension => {
      const expected = `${basePath}${exampleKey}-example-${extension}.html`;
      const actual = component.exampleTabs[extension.toUpperCase()];

      expect(actual).toEqual(expected);
    });
  }));

  describe('view-source tab group', () => {

    it('should only render HTML, TS and CSS files if no additional files are specified', () => {
      component.example = exampleKey;
      fixture.detectChanges();

      expect(component._getExampleTabNames()).toEqual(['HTML', 'TS', 'CSS']);
    });

    it('should be able to render additional files', () => {
      EXAMPLE_COMPONENTS['additional-files'] = {
        ...EXAMPLE_COMPONENTS[exampleKey],
        additionalFiles: ['some-additional-file.html'],
      };

      component.example = 'additional-files';
      fixture.detectChanges();

      expect(component._getExampleTabNames())
        .toEqual(['HTML', 'TS', 'CSS', 'some-additional-file.html']);
    });
  });

  describe('copy button', () => {
    let button: HTMLElement;

    beforeEach(() => {
      // Open source view
      component.example = exampleKey;
      component.showSource = true;
      fixture.detectChanges();

      for (const url of Object.keys(FAKE_DOCS)) {
        http.expectOne(url).flush(FAKE_DOCS[url]);
      }

      // Select button element
      const btnDe = fixture.debugElement.query(By.css('.docs-example-source-copy'));
      button = btnDe ? btnDe.nativeElement : null;
    });

    it('should call copier service when clicked', (() => {
      const copierService: CopierService = TestBed.get(CopierService);
      const spy = spyOn(copierService, 'copyText');
      expect(spy.calls.count()).toBe(0, 'before click');
      button.click();
      expect(spy.calls.count()).toBe(1, 'after click');
      expect(spy.calls.argsFor(0)[0]).toBe('my docs page', 'click content');
    }));

    it('should display a message when copy succeeds', (() => {
      const snackBar: MatSnackBar = TestBed.get(MatSnackBar);
      const copierService: CopierService = TestBed.get(CopierService);
      spyOn(snackBar, 'open');
      spyOn(copierService, 'copyText').and.returnValue(true);
      button.click();
      expect(snackBar.open).toHaveBeenCalledWith('Code copied', '', {duration: 2500});
    }));

    it('should display an error when copy fails', (() => {
      const snackBar: MatSnackBar = TestBed.get(MatSnackBar);
      const copierService: CopierService = TestBed.get(CopierService);
      spyOn(snackBar, 'open');
      spyOn(copierService, 'copyText').and.returnValue(false);
      button.click();
      expect(snackBar.open)
          .toHaveBeenCalledWith('Copy failed. Please try again!', '', {duration: 2500});
    }));
  });

});


// Create a version of ExampleModule for testing with only one component so that we don't have
// to compile all of the examples for these tests.
@NgModule({
  imports: [
    MatInputModule,
    MatAutocompleteModule,
    MatSlideToggleModule,
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
