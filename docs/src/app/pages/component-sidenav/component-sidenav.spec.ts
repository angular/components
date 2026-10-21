import {provideZoneChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {MatSidenav} from '@angular/material/sidenav';
import {provideRouter, withComponentInputBinding} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';
import {DocumentationItems} from '../../shared/documentation-items/documentation-items';
import {ComponentSidenav, componentSidenavRoutes} from './component-sidenav';

describe('ComponentSidenav', () => {
  let fixture: ComponentFixture<ComponentSidenav>;
  let component: ComponentSidenav;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideZoneChangeDetection()],
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
      expect(component.isScreenSmall()).toBeTruthy();
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

describe('ComponentSidenav routing', () => {
  it('should list the items of the section from the route params', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [{path: ':section', children: componentSidenavRoutes}],
          withComponentInputBinding(),
        ),
        provideZoneChangeDetection(),
      ],
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/components/categories');
    await harness.fixture.whenStable();
    harness.detectChanges();

    const items = await TestBed.inject(DocumentationItems).getItems('components');
    const links = Array.from<HTMLAnchorElement>(
      harness.routeNativeElement!.querySelectorAll('.docs-component-viewer-nav a'),
    );

    expect(items.length).toBeGreaterThan(0);
    expect(links.length).toBe(items.length);
    expect(links.some(link => link.getAttribute('href')?.startsWith('/components/'))).toBe(true);
  });
});
