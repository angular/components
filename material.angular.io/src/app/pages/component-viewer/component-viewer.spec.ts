import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {ComponentViewer, ComponentViewerModule} from './component-viewer';
import {DocsAppTestingModule} from '../../testing/testing-module';

import {EXAMPLE_COMPONENTS} from '@angular/material-examples';
import {MdButtonModule} from '@angular/material';
import {NgModule} from '@angular/core';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

const docItemsId = 'button';
const exampleKey = 'button-types';

const mockActivatedRoute = {
  snapshot: {},
  fragment: Observable.create(observer => {
    observer.complete();
  }),
  params: Observable.create(observer => {
    observer.next({id: docItemsId});
    observer.complete();
  })
};

describe('ComponentViewer', () => {
  let fixture: ComponentFixture<ComponentViewer>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ComponentViewerModule, DocsAppTestingModule, TestExampleModule],
      providers: [
        {provide: ActivatedRoute, useValue: mockActivatedRoute},
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentViewer);
  });

  it('should set page title correctly', () => {
    const component = fixture.componentInstance;
    fixture.detectChanges();
    const expected = `${component.docItems.getItemById(docItemsId).name}`;
    expect(component._componentPageTitle.title).toEqual(expected);
  });
});


// Create a version of ExampleModule for testing with only one component so that we odn't have
// to compile all of the examples for these tests.
@NgModule({
  imports: [
    MdButtonModule,
    NoopAnimationsModule,
  ],
  declarations: [EXAMPLE_COMPONENTS[exampleKey].component],
  entryComponents: [EXAMPLE_COMPONENTS[exampleKey].component],
})
class TestExampleModule { }
