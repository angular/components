import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Http} from '@angular/http';
import {MaterialModule} from '@angular/material';

import {EXAMPLE_COMPONENTS, ExampleModule, LiveExample} from '@angular/material-examples';
import {ExampleViewer} from './example-viewer';

const exampleComponentString = 'autocomplete-overview';


// Required for the set example function
@NgModule({
  imports: [
    ExampleModule,
    BrowserAnimationsModule,
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class TestAutocompleteOverviewModule {
}


class MockHTTP {
}


describe('ExampleViewer', () => {
  let fixture: ComponentFixture<ExampleViewer>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MaterialModule, ReactiveFormsModule, TestAutocompleteOverviewModule],
      declarations: [ExampleViewer],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: Http, useClass: MockHTTP}
      ]
    });

    fixture = TestBed.createComponent(ExampleViewer);
  }));

  it('should toggle showSource boolean', () => {
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.showSource).toBe(false);
    component.toggleSourceView();
    expect(component.showSource).toBe(true);
  });

  it('should set and return example properly', () => {
    const component = fixture.componentInstance;
    component.example = exampleComponentString;
    fixture.detectChanges();
    const data = component.exampleData;
    // TODO(jelbourn): remove `as any` once LiveExample is updated to hve optional members.
    expect(data).toEqual(EXAMPLE_COMPONENTS[exampleComponentString] as any);
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
    component.example = exampleComponentString;
    fixture.detectChanges();

    // get example file path for each extension
    const extensions = ['ts', 'css', 'html'];
    const basePath = '/assets/examples/';
    extensions.forEach(ext => {
      const expected = `${basePath}${exampleComponentString}-example-${ext}.html`;
      const actual = component.exampleFileUrl(ext);
      expect(actual).toEqual(expected);
    });
  });
});
