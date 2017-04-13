import {async, TestBed, ComponentFixture} from '@angular/core/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {RouterTestingModule} from '@angular/router/testing';
import {ActivatedRoute} from '@angular/router';
import {MaterialModule} from '@angular/material';
import {Observable} from 'rxjs/Observable';

import {DocumentationItems} from '../../shared/documentation-items/documentation-items';
import {ComponentPageTitle} from '../page-title/page-title';
import {ComponentViewer} from './component-viewer';

const docItemsID = 'button';

const mockActivatedRoute = {
  params: Observable.create(observer => {
    observer.next({id: docItemsID});
    observer.complete();
  })
};


describe('ComponentViewer', () => {
  let fixture: ComponentFixture<ComponentViewer>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MaterialModule,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ComponentViewer],
      providers: [
        {provide: ActivatedRoute, useValue: mockActivatedRoute},
        ComponentPageTitle,
        DocumentationItems
      ]
    });

    fixture = TestBed.createComponent(ComponentViewer);
  }));

  it('should set page title correctly', () => {
    const component = fixture.componentInstance;
    fixture.detectChanges();
    const expected = `Component - ${component.docItems.getItemById(docItemsID).name}`;
    expect(component._componentPageTitle.title).toEqual(expected);
  });
});
