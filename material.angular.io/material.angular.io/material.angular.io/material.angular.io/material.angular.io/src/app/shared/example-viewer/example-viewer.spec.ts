import {NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {async, TestBed, ComponentFixture} from '@angular/core/testing';
import {Http} from '@angular/http';
import {MaterialModule, ComponentPortal} from '@angular/material';

import {AutocompleteOverviewExample} from '../../examples/autocomplete-overview/autocomplete-overview-example';
import {EXAMPLE_COMPONENTS} from '../../examples/example-module';
import {ExampleViewer} from './example-viewer';

const exampleComponentString = 'autocomplete-overview';


// Required for the set example function
@NgModule({
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [AutocompleteOverviewExample],
  entryComponents: [AutocompleteOverviewExample]
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
    expect(data).toEqual(EXAMPLE_COMPONENTS[exampleComponentString]);
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
