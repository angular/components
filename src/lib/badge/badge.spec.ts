import {async, ComponentFixture, TestBed, inject} from '@angular/core/testing';
import {HttpModule, XHRBackend} from '@angular/http';
import {MockBackend} from '@angular/http/testing';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MatBadge, MatIconBadge, MatSvgIconBadge, MatBadgeModule} from './index';
import {MatIconRegistry} from '../icon/icon-registry';
import {SafeResourceUrl, DomSanitizer} from '@angular/platform-browser';
import {getFakeSvgHttpResponse} from '../icon/fake-svgs';

describe('MatBadge', () => {
  let fixture: ComponentFixture<any>;
  let testComponent: TestApp;
  let iconRegistry: MatIconRegistry;
  let sanitizer: DomSanitizer;
  let httpRequestUrls: string[];

  function trust(iconUrl: string): SafeResourceUrl {
    return sanitizer.bypassSecurityTrustResourceUrl(iconUrl);
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatBadgeModule, HttpModule],
      declarations: [TestApp],
      providers: [
        MatIconRegistry,
        MockBackend,
        {provide: XHRBackend, useExisting: MockBackend},
      ]
    });

    TestBed.compileComponents();
  }));

  let deps = [MatIconRegistry, MockBackend, DomSanitizer];
  beforeEach(inject(deps, (mir: MatIconRegistry, mockBackend: MockBackend, ds: DomSanitizer) => {
    iconRegistry = mir;
    sanitizer = ds;
    httpRequestUrls = [];

    mockBackend.connections.subscribe((connection: any) => {
      const url = connection.request.url;
      httpRequestUrls.push(url);
      connection.mockRespond(getFakeSvgHttpResponse(url));
    });

    iconRegistry.addSvgIcon('fluffy', trust('cat.svg'));
    iconRegistry.addSvgIcon('fido', trust('dog.svg'));

    fixture = TestBed.createComponent(TestApp);
    testComponent = fixture.debugElement.componentInstance;
    fixture.detectChanges();
  }));

  describe('MatBadge Text', () => {
    let badgeDebugElement: DebugElement;

    beforeEach(async(() => {
      badgeDebugElement = fixture.debugElement.query(By.directive(MatBadge));
      fixture.detectChanges();
    }));

    it('should update the badge based on attribute', () => {
      let badgeContentDebugElement =
          badgeDebugElement.nativeElement.querySelector('.mat-badge-content');

      expect(badgeContentDebugElement.innerHTML).toContain('1');

      testComponent.badgeContent = '22';
      fixture.detectChanges();

      badgeContentDebugElement =
          badgeDebugElement.nativeElement.querySelector('.mat-badge-content');
      expect(badgeContentDebugElement.innerHTML).toContain('22');
    });

    it('should apply class based on color attribute', () => {
      testComponent.badgeColor = 'primary';
      fixture.detectChanges();
      expect(badgeDebugElement.nativeElement.classList.contains('mat-badge-primary')).toBe(true);

      testComponent.badgeColor = 'accent';
      fixture.detectChanges();
      expect(badgeDebugElement.nativeElement.classList.contains('mat-badge-accent')).toBe(true);

      testComponent.badgeColor = 'warn';
      fixture.detectChanges();
      expect(badgeDebugElement.nativeElement.classList.contains('mat-badge-warn')).toBe(true);

      testComponent.badgeColor = null;
      fixture.detectChanges();

      expect(badgeDebugElement.nativeElement.classList).not.toContain('mat-badge-accent');
    });

    it('should update the badget position on direction change', () => {
      expect(badgeDebugElement.nativeElement.classList.contains('mat-badge-above')).toBe(true);
      expect(badgeDebugElement.nativeElement.classList.contains('mat-badge-after')).toBe(true);

      testComponent.badgeDirection = 'below before';
      fixture.detectChanges();

      expect(badgeDebugElement.nativeElement.classList.contains('mat-badge-below')).toBe(true);
      expect(badgeDebugElement.nativeElement.classList.contains('mat-badge-before')).toBe(true);
    });
  });

  describe('MatBadge Font Icon', () => {
    let badgeDebugElement: DebugElement;

    beforeEach(async(() => {
      badgeDebugElement = fixture.debugElement.query(By.directive(MatIconBadge));
      fixture.detectChanges();
    }));

    it('should update the badge icon based on attribute', () => {
      let badgeContentDebugElement =
          badgeDebugElement.nativeElement.querySelector('.mat-badge-icon');

      expect(badgeContentDebugElement.innerHTML).toContain('home');

      testComponent.badgeIcon = 'phone';
      fixture.detectChanges();

      badgeContentDebugElement =
          badgeDebugElement.nativeElement.querySelector('.mat-badge-icon');

      expect(badgeContentDebugElement.innerHTML).toContain('phone');
    });
  });

  describe('MatBadge SVG Icon', () => {
    let badgeDebugElement: DebugElement;

    beforeEach(() => {
      badgeDebugElement = fixture.debugElement.query(By.directive(MatSvgIconBadge));
      fixture.detectChanges();
    });

    it('should update the badge svg based on attribute', async() => {
      let badgeContentDebugElement =
          badgeDebugElement.nativeElement.querySelector('.mat-badge-svg-icon');

      expect(badgeContentDebugElement.innerHTML).toContain('<path id="meow"></path>');

      testComponent.badgeSvg = 'fido';
      fixture.detectChanges();

      badgeContentDebugElement =
          badgeDebugElement.nativeElement.querySelector('.mat-badge-svg-icon');

      expect(badgeContentDebugElement.innerHTML).toContain('<path id="woof"></path>');
    });
  });

});

/** Test component that contains an MatBadge. */
@Component({
  selector: 'test-app',
  template: `
    <mat-icon [matBadge]="badgeContent"
              [matBadgeColor]="badgeColor"
              [matBadgePosition]="badgeDirection">
      home
    </mat-icon>
    <span [matIconBadge]="badgeIcon">
      Hello
    </span>
    <span [matSvgIconBadge]="badgeSvg">
      Hello
    </span>
  `
})
class TestApp {
  badgeColor;
  badgeContent = '1';
  badgeIcon = 'home';
  badgeSvg = 'fluffy';
  badgeDirection = 'above after';
}
