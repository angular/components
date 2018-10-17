import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MatSidenav} from '@angular/material';
import {take} from 'rxjs/operators';
import {ComponentSidenav, ComponentSidenavModule} from './component-sidenav';
import {DocsAppTestingModule} from '../../testing/testing-module';

describe('ComponentSidenav', () => {
  let fixture: ComponentFixture<ComponentSidenav>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ComponentSidenavModule, DocsAppTestingModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentSidenav);
  });

  it('should close the sidenav on init', () => {
    const component = fixture.componentInstance;

    // Spy on window.mediaMatch and return stub
    spyOn(window, 'matchMedia').and.returnValue({
      matches: true
    });

    fixture.detectChanges();
    async(() => {
      expect(component.sidenav instanceof MatSidenav).toBeTruthy();
      component.isScreenSmall.pipe(take(1)).subscribe(isSmall => expect(isSmall).toBeTruthy());
      expect(component.sidenav.opened).toBe(false);
    });
  });

  it('should show a link for each item in doc items categories', () => {
    const component = fixture.componentInstance;

    fixture.detectChanges();

    const totalItems = component.docItems.getItems('categories').length;
    const totalLinks = fixture
      .nativeElement
      .querySelectorAll('.docs-component-viewer-sidenav li a')
      .length;
    expect(totalLinks).toEqual(totalItems);
  });
});
