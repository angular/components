import {async, TestBed, ComponentFixture} from '@angular/core/testing';
import {MaterialModule, MdSidenav} from '@angular/material';
import {RouterTestingModule} from '@angular/router/testing';
import {Observable} from 'rxjs/Observable';
import {Router} from '@angular/router';
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from '@angular/core';

import {DocumentationItems} from '../../shared/documentation-items/documentation-items';
import {ComponentSidenav} from './component-sidenav';

const mockRouter = {
  events: Observable.create(observer => {
    observer.next(null);
    observer.complete();
  })
};


describe('ComponentSidenav', () => {
  let fixture: ComponentFixture<ComponentSidenav>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MaterialModule],
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [ComponentSidenav],
      providers: [
        {provide: Router, useValue: mockRouter},
        DocumentationItems
      ],
    });

    fixture = TestBed.createComponent(ComponentSidenav);
  }));

  it('should close the sidenav on init', () => {
    const component = fixture.componentInstance;

    // Spy on window.mediaMatch and return stub
    spyOn(window, 'matchMedia').and.returnValue({
      matches: true
    });

    // Spy on viewChild component's `close` method
    spyOn(component.sidenav, 'close');

    fixture.detectChanges();

    expect(component.sidenav instanceof MdSidenav).toBeTruthy();
    expect(component.isScreenSmall()).toBeTruthy();
    expect(component.sidenav.close).toHaveBeenCalled();
  });

  it('should show a link for each item in doc items categories', () => {
    const component = fixture.componentInstance;

    fixture.detectChanges();

    const totalItems = component.docItems.getAllItems().length;
    const totalLinks = fixture
      .nativeElement
      .querySelectorAll('.docs-component-viewer-sidenav li a')
      .length;
    expect(totalLinks).toEqual(totalItems);
  });
});
