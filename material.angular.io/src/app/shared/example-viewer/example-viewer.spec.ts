import {ReactiveFormsModule} from '@angular/forms';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {EXAMPLE_COMPONENTS} from '@angular/material-examples';
import {ExampleViewer} from './example-viewer';
import {DocsAppTestingModule} from '../../testing/testing-module';
import {DocViewerModule} from '../doc-viewer/doc-viewer-module';
import {MdAutocompleteModule, MdInputModule} from '@angular/material';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

const exampleKey = 'autocomplete-overview';


describe('ExampleViewer', () => {
  let fixture: ComponentFixture<ExampleViewer>;

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

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleViewer);
  });

  it('should toggle showSource boolean', () => {
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.showSource).toBe(false);
    component.toggleSourceView();
    expect(component.showSource).toBe(true);
  });

  it('should set and return example properly', () => {
    const component = fixture.componentInstance;
    component.example = exampleKey;
    fixture.detectChanges();
    const data = component.exampleData;
    // TODO(jelbourn): remove `as any` once LiveExample is updated to have optional members.
    expect(data).toEqual(EXAMPLE_COMPONENTS[exampleKey] as any);
  });

  it('should log message about missing example', () => {
    const component = fixture.componentInstance;
    spyOn(console, 'log');
    component.example = 'foobar';
    fixture.detectChanges();
    expect(console.log).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('MISSING EXAMPLE: ', 'foobar');
  });

  it('should return assets path for example based on extension', () => {
    // set example
    const component = fixture.componentInstance;
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
});


// Create a version of ExampleModule for testing with only one component so that we odn't have
// to compile all of the examples for these tests.
@NgModule({
  imports: [
    MdInputModule,
    MdAutocompleteModule,
    CommonModule,
    ReactiveFormsModule,
    NoopAnimationsModule
  ],
  declarations: [EXAMPLE_COMPONENTS[exampleKey].component],
  entryComponents: [EXAMPLE_COMPONENTS[exampleKey].component],
})
class TestExampleModule { }
