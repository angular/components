import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, DebugElement, ViewEncapsulation, ViewChild, signal} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MatBadge, MatBadgeModule} from './index';
import {ThemePalette} from '@angular/material/core';

describe('MatBadge', () => {
  let fixture: ComponentFixture<any>;
  let badgeHostNativeElement: HTMLElement;
  let badgeHostDebugElement: DebugElement;

  describe('on an interative host', () => {
    let testComponent: BadgeOnInteractiveElement;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          MatBadgeModule,
          BadgeOnInteractiveElement,
          PreExistingBadge,
          NestedBadge,
          BadgeOnTemplate,
        ],
      });

      fixture = TestBed.createComponent(BadgeOnInteractiveElement);
      testComponent = fixture.debugElement.componentInstance;
      fixture.detectChanges();

      badgeHostDebugElement = fixture.debugElement.query(By.directive(MatBadge))!;
      badgeHostNativeElement = badgeHostDebugElement.nativeElement;
    });

    it('should update the badge based on attribute', () => {
      const badgeElement = badgeHostNativeElement.querySelector('.mat-badge-content')!;
      expect(badgeElement.textContent).toContain('1');

      testComponent.badgeContent.set('22');
      fixture.detectChanges();
      expect(badgeElement.textContent).toContain('22');
    });

    it('should be able to pass in falsy values to the badge content', () => {
      const badgeElement = badgeHostNativeElement.querySelector('.mat-badge-content')!;
      expect(badgeElement.textContent).toContain('1');

      testComponent.badgeContent.set(0);
      fixture.detectChanges();
      expect(badgeElement.textContent).toContain('0');
    });

    it('should treat null and undefined as empty strings in the badge content', () => {
      const badgeElement = badgeHostNativeElement.querySelector('.mat-badge-content')!;
      expect(badgeElement.textContent).toContain('1');

      testComponent.badgeContent.set(null);
      fixture.detectChanges();
      expect(badgeElement.textContent?.trim()).toBe('');

      testComponent.badgeContent.set(undefined);
      fixture.detectChanges();
      expect(badgeElement.textContent?.trim()).toBe('');
    });

    it('should apply class based on color attribute', () => {
      testComponent.badgeColor.set('primary');
      fixture.detectChanges();
      expect(badgeHostNativeElement.classList.contains('mat-badge-primary')).toBe(true);

      testComponent.badgeColor.set('accent');
      fixture.detectChanges();
      expect(badgeHostNativeElement.classList.contains('mat-badge-accent')).toBe(true);

      testComponent.badgeColor.set('warn');
      fixture.detectChanges();
      expect(badgeHostNativeElement.classList.contains('mat-badge-warn')).toBe(true);

      testComponent.badgeColor.set(undefined);
      fixture.detectChanges();

      expect(badgeHostNativeElement.classList).not.toContain('mat-badge-accent');
    });

    it('should update the badge position on direction change', () => {
      expect(badgeHostNativeElement.classList.contains('mat-badge-above')).toBe(true);
      expect(badgeHostNativeElement.classList.contains('mat-badge-after')).toBe(true);

      testComponent.badgeDirection.set('below before');
      fixture.detectChanges();

      expect(badgeHostNativeElement.classList.contains('mat-badge-below')).toBe(true);
      expect(badgeHostNativeElement.classList.contains('mat-badge-before')).toBe(true);
    });

    it('should change visibility to hidden', () => {
      expect(badgeHostNativeElement.classList.contains('mat-badge-hidden')).toBe(false);

      testComponent.badgeHidden.set(true);
      fixture.detectChanges();

      expect(badgeHostNativeElement.classList.contains('mat-badge-hidden')).toBe(true);
    });

    it('should change badge sizes', () => {
      expect(badgeHostNativeElement.classList.contains('mat-badge-medium')).toBe(true);

      testComponent.badgeSize.set('small');
      fixture.detectChanges();

      expect(badgeHostNativeElement.classList.contains('mat-badge-small')).toBe(true);

      testComponent.badgeSize.set('large');
      fixture.detectChanges();

      expect(badgeHostNativeElement.classList.contains('mat-badge-large')).toBe(true);
    });

    it('should change badge overlap', () => {
      expect(badgeHostNativeElement.classList.contains('mat-badge-overlap')).toBe(false);

      testComponent.badgeOverlap.set(true);
      fixture.detectChanges();

      expect(badgeHostNativeElement.classList.contains('mat-badge-overlap')).toBe(true);
    });

    it('should toggle `aria-describedby` depending on whether the badge has a description', () => {
      expect(badgeHostNativeElement.hasAttribute('aria-describedby')).toBeFalse();

      testComponent.badgeDescription.set('Describing a badge');
      fixture.detectChanges();

      const describedById = badgeHostNativeElement.getAttribute('aria-describedby') || '';
      const description = document.getElementById(describedById)?.textContent;
      expect(description).toBe('Describing a badge');

      testComponent.badgeDescription.set('');
      fixture.detectChanges();

      expect(badgeHostNativeElement.hasAttribute('aria-describedby')).toBeFalse();
    });

    it('should toggle visibility based on whether the badge has content', () => {
      const classList = badgeHostNativeElement.classList;

      expect(classList.contains('mat-badge-hidden')).toBe(false);

      testComponent.badgeContent.set('');
      fixture.detectChanges();

      expect(classList.contains('mat-badge-hidden')).toBe(true);

      testComponent.badgeContent.set('hello');
      fixture.detectChanges();

      expect(classList.contains('mat-badge-hidden')).toBe(false);

      testComponent.badgeContent.set(' ');
      fixture.detectChanges();

      expect(classList.contains('mat-badge-hidden')).toBe(true);

      testComponent.badgeContent.set(0);
      fixture.detectChanges();

      expect(classList.contains('mat-badge-hidden')).toBe(false);
    });

    it('should apply view encapsulation on create badge content', () => {
      const badge = badgeHostNativeElement.querySelector('.mat-badge-content')!;
      let encapsulationAttr: Attr | undefined;

      for (let i = 0; i < badge.attributes.length; i++) {
        if (badge.attributes[i].name.startsWith('_ngcontent-')) {
          encapsulationAttr = badge.attributes[i];
          break;
        }
      }

      expect(encapsulationAttr).toBeTruthy();
    });

    it('should toggle a class depending on the badge disabled state', () => {
      const element: HTMLElement = badgeHostDebugElement.nativeElement;

      expect(element.classList).not.toContain('mat-badge-disabled');

      testComponent.badgeDisabled.set(true);
      fixture.detectChanges();

      expect(element.classList).toContain('mat-badge-disabled');
    });

    it('should clear any pre-existing badges', () => {
      const preExistingFixture = TestBed.createComponent(PreExistingBadge);
      preExistingFixture.detectChanges();

      expect(preExistingFixture.nativeElement.querySelectorAll('.mat-badge-content').length).toBe(
        1,
      );
    });

    it('should not clear badge content from child elements', () => {
      const preExistingFixture = TestBed.createComponent(NestedBadge);
      preExistingFixture.detectChanges();

      expect(preExistingFixture.nativeElement.querySelectorAll('.mat-badge-content').length).toBe(
        2,
      );
    });

    it('should expose the badge element', () => {
      const badgeElement = badgeHostNativeElement.querySelector('.mat-badge-content')!;
      expect(fixture.componentInstance.badgeInstance.getBadgeElement()).toBe(badgeElement);
    });

    it('should throw if badge is not attached to an element node', () => {
      expect(() => {
        TestBed.createComponent(BadgeOnTemplate);
      }).toThrowError(/matBadge must be attached to an element node/);
    });

    it('should not insert an inline description', () => {
      expect(badgeHostNativeElement.nextSibling)
        .withContext('The badge host should not have an inline sibling description')
        .toBeNull();
    });
  });

  describe('on an non-interactive host', () => {
    let testComponent: BadgeOnNonInteractiveElement;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [MatBadgeModule, BadgeOnNonInteractiveElement],
      });

      fixture = TestBed.createComponent(BadgeOnNonInteractiveElement);
      testComponent = fixture.debugElement.componentInstance;
      fixture.detectChanges();

      badgeHostDebugElement = fixture.debugElement.query(By.directive(MatBadge))!;
      badgeHostNativeElement = badgeHostDebugElement.nativeElement;
    });

    it('should insert the description inline after the host', () => {
      testComponent.description.set('Extra info');
      fixture.detectChanges();

      const inlineDescription = badgeHostNativeElement.querySelector('.cdk-visually-hidden')!;
      expect(inlineDescription)
        .withContext('A visually hidden description element should exist')
        .toBeDefined();
      expect(inlineDescription.textContent)
        .withContext('The badge host next sibling should contain its description')
        .toBe('Extra info');

      testComponent.description.set('Different info');
      fixture.detectChanges();

      expect(inlineDescription.textContent)
        .withContext('The inline description should update')
        .toBe('Different info');
    });

    it('should not apply aria-describedby for non-interactive hosts', () => {
      testComponent.description.set('Extra info');
      fixture.detectChanges();

      expect(badgeHostNativeElement.hasAttribute('aria-description'))
        .withContext('Non-interactive hosts should not have aria-describedby')
        .toBeFalse();
    });
  });
});

/** Test component that contains a MatBadge. */
@Component({
  // Explicitly set the view encapsulation since we have a test that checks for it.
  encapsulation: ViewEncapsulation.Emulated,
  styles: 'button { color: hotpink; }',
  template: `
    <button [matBadge]="badgeContent()"
            [matBadgeColor]="badgeColor()"
            [matBadgePosition]="badgeDirection()"
            [matBadgeHidden]="badgeHidden()"
            [matBadgeSize]="badgeSize()"
            [matBadgeOverlap]="badgeOverlap()"
            [matBadgeDescription]="badgeDescription()"
            [matBadgeDisabled]="badgeDisabled()">
      home
    </button>
  `,
  imports: [MatBadgeModule],
})
class BadgeOnInteractiveElement {
  @ViewChild(MatBadge) badgeInstance: MatBadge;
  badgeColor = signal<ThemePalette>(undefined);
  badgeContent = signal<string | number | undefined | null>('1');
  badgeDirection = signal('above after');
  badgeHidden = signal(false);
  badgeSize = signal('medium');
  badgeOverlap = signal(false);
  badgeDescription = signal<string | undefined>(undefined);
  badgeDisabled = signal(false);
}

@Component({
  template: '<span matBadge="7" [matBadgeDescription]="description()">Hello</span>',
  imports: [MatBadgeModule],
})
class BadgeOnNonInteractiveElement {
  description = signal('');
}

@Component({
  template: `
    <span matBadge="Hello">
      home
      <div class="mat-badge-content">Pre-existing badge</div>
    </span>
  `,
  imports: [MatBadgeModule],
})
class PreExistingBadge {}

@Component({
  template: `
    <span matBadge="Hello">
      home
      <span matBadge="Hi">Something</span>
    </span>
  `,
  imports: [MatBadgeModule],
})
class NestedBadge {}

@Component({
  template: `
    <ng-template matBadge="1">Notifications</ng-template>`,
  imports: [MatBadgeModule],
})
class BadgeOnTemplate {}
