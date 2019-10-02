import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {take} from 'rxjs/operators';
import {ComponentSidenav, ComponentSidenavModule} from './component-sidenav';
import {DocsAppTestingModule} from '../../testing/testing-module';
import {MatSidenav} from '@angular/material/sidenav';

describe('ComponentSidenav', () => {
  let fixture: ComponentFixture<ComponentSidenav>;
  let component: ComponentSidenav;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ComponentSidenavModule, DocsAppTestingModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentSidenav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should close the sidenav on init', () => {
    // Spy on window.mediaMatch and return stub
    spyOn(window, 'matchMedia').and.returnValue({
      matches: true
    } as any);

    // TODO refactor this as none of these expectations are ever verified
    async(() => {
      expect(component.sidenav instanceof MatSidenav).toBeTruthy();
      component.isScreenSmall.pipe(take(1)).subscribe(isSmall => expect(isSmall).toBeTruthy());
      expect(component.sidenav.opened).toBe(false);
    });
  });

  it('should show a link for each item in doc items categories', () => {
    const totalItems = component.docItems.getItems('categories').length;
    const totalLinks = fixture
      .nativeElement
      .querySelectorAll('.docs-component-viewer-sidenav li a')
      .length;
    expect(totalLinks).toEqual(totalItems);
  });
});
