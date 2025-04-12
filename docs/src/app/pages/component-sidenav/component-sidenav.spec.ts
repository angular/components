import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {take} from 'rxjs/operators';
import {ComponentSidenav} from './component-sidenav';
import {MatSidenav} from '@angular/material/sidenav';
import {provideRouter} from '@angular/router';

describe('ComponentSidenav', () => {
  let fixture: ComponentFixture<ComponentSidenav>;
  let component: ComponentSidenav;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });

    fixture = TestBed.createComponent(ComponentSidenav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should close the sidenav on init', () => {
    // Spy on window.mediaMatch and return stub
    spyOn(window, 'matchMedia').and.returnValue({
      matches: true,
    } as any);

    // TODO refactor this as none of these expectations are ever verified
    waitForAsync(() => {
      expect(component.sidenav() instanceof MatSidenav).toBeTruthy();
      component.isScreenSmall.pipe(take(1)).subscribe(isSmall => expect(isSmall).toBeTruthy());
      expect(component.sidenav()!.opened).toBe(false);
    });
  });

  it('should show a link for each item in doc items categories', async () => {
    const items = await component.docItems.getItems('categories');
    const totalItems = items.length;
    const totalLinks = fixture.nativeElement.querySelectorAll(
      '.docs-component-viewer-sidenav li a',
    ).length;
    expect(totalLinks).toEqual(totalItems);
  });
});
