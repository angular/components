/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, DebugElement, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {provideFakeDirectionality, runAccessibilityChecks} from '@angular/cdk/testing/private';
import {_IdGenerator} from '@angular/cdk/a11y';
import {DisclosureTrigger} from './disclosure-trigger';
import {DisclosureContent} from './disclosure-content';

/**
 * Tests organized according to POUR principles:
 * @see https://www.w3.org/WAI/fundamentals/accessibility-principles/
 *
 * - Perceivable: Content visibility and presentation
 * - Operable: Keyboard, pointer, and programmatic interactions
 * - Understandable: Predictable behavior and state management
 * - Robust: ARIA attributes and assistive technology compatibility
 *
 * Note: This file tests Angular directives that interact with the DOM and apply ARIA attributes.
 * For the framework-agnostic pattern logic tests, see: src/aria/private/disclosure/disclosure.spec.ts
 */
describe('Disclosure Directives', () => {
  let fixture: ComponentFixture<DisclosureTestComponent>;
  let triggerDebugElement: DebugElement;
  let contentDebugElement: DebugElement;
  let triggerElement: HTMLElement;
  let contentElement: HTMLElement;
  let component: DisclosureTestComponent;

  function keydown(target: HTMLElement, key: string, keyCode: number) {
    target.dispatchEvent(new KeyboardEvent('keydown', {bubbles: true, key, keyCode}));
    fixture.detectChanges();
  }

  function pointerdown(target: HTMLElement) {
    target.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, button: 0}));
    fixture.detectChanges();
  }

  const space = (target: HTMLElement) => keydown(target, ' ', 32);
  const enter = (target: HTMLElement) => keydown(target, 'Enter', 13);

  function setupTest() {
    fixture.detectChanges();
    triggerDebugElement = fixture.debugElement.query(By.directive(DisclosureTrigger));
    contentDebugElement = fixture.debugElement.query(By.directive(DisclosureContent));
    triggerElement = triggerDebugElement.nativeElement;
    contentElement = contentDebugElement.nativeElement;
    component = fixture.componentInstance;
  }

  /**
   * Accessibility is validated after each test using axe-core.
   * @see https://github.com/dequelabs/axe-core
   */
  afterEach(async () => {
    await runAccessibilityChecks(fixture.nativeElement);
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideFakeDirectionality('ltr'), _IdGenerator],
    });

    fixture = TestBed.createComponent(DisclosureTestComponent);
  });

  /**
   * PERCEIVABLE
   * Content visibility, Content identification
   *
   * Information and user interface components must be presentable to users
   * in ways they can perceive.
   *
   * @see https://www.w3.org/WAI/fundamentals/accessibility-principles/#perceivable
   */
  describe('Perceivable', () => {
    describe('Content visibility (hidden attribute)', () => {
      beforeEach(() => setupTest());

      it('should hide content when collapsed', () => {
        expect(contentElement.hasAttribute('hidden')).toBeTrue();
      });

      it('should show content when expanded', () => {
        component.expanded.set(true);
        fixture.detectChanges();
        expect(contentElement.hasAttribute('hidden')).toBeFalse();
      });

      it('should toggle content visibility with trigger interaction', () => {
        pointerdown(triggerElement);
        expect(contentElement.hasAttribute('hidden')).toBeFalse();
        pointerdown(triggerElement);
        expect(contentElement.hasAttribute('hidden')).toBeTrue();
      });
    });

    describe('Content identification', () => {
      beforeEach(() => setupTest());

      it('should have an id attribute on content', () => {
        expect(contentElement.id).toBeTruthy();
        expect(contentElement.id).toContain('disclosure-content-test');
      });
    });
  });

  /**
   * OPERABLE
   * Keyboard interaction, Pointer interaction, Programmatic API, Focus management
   *
   * User interface components and navigation must be operable.
   *
   * @see https://www.w3.org/WAI/fundamentals/accessibility-principles/#operable
   */
  describe('Operable', () => {
    describe('Keyboard interaction', () => {
      beforeEach(() => setupTest());

      it('should expand on Enter key', () => {
        expect(component.expanded()).toBeFalse();
        enter(triggerElement);
        expect(component.expanded()).toBeTrue();
      });

      it('should collapse on Enter key when expanded', () => {
        component.expanded.set(true);
        fixture.detectChanges();
        enter(triggerElement);
        expect(component.expanded()).toBeFalse();
      });

      it('should expand on Space key', () => {
        expect(component.expanded()).toBeFalse();
        space(triggerElement);
        expect(component.expanded()).toBeTrue();
      });

      it('should collapse on Space key when expanded', () => {
        component.expanded.set(true);
        fixture.detectChanges();
        space(triggerElement);
        expect(component.expanded()).toBeFalse();
      });

      it('should not expand on Enter key when disabled', () => {
        component.disabled.set(true);
        fixture.detectChanges();
        enter(triggerElement);
        expect(component.expanded()).toBeFalse();
      });

      it('should not expand on Space key when disabled', () => {
        component.disabled.set(true);
        fixture.detectChanges();
        space(triggerElement);
        expect(component.expanded()).toBeFalse();
      });
    });

    describe('Pointer interaction', () => {
      beforeEach(() => setupTest());

      it('should expand on pointer click', () => {
        expect(component.expanded()).toBeFalse();
        pointerdown(triggerElement);
        expect(component.expanded()).toBeTrue();
      });

      it('should collapse on pointer click when expanded', () => {
        component.expanded.set(true);
        fixture.detectChanges();
        pointerdown(triggerElement);
        expect(component.expanded()).toBeFalse();
      });

      it('should not expand on pointer click when disabled', () => {
        component.disabled.set(true);
        fixture.detectChanges();
        pointerdown(triggerElement);
        expect(component.expanded()).toBeFalse();
      });
    });

    describe('Programmatic API (expand, collapse, toggle)', () => {
      beforeEach(() => setupTest());

      it('should expand via expand() method', () => {
        const trigger = triggerDebugElement.injector.get(DisclosureTrigger);
        expect(component.expanded()).toBeFalse();
        trigger.expand();
        fixture.detectChanges();
        expect(component.expanded()).toBeTrue();
        expect(contentElement.hasAttribute('hidden')).toBeFalse();
      });

      it('should collapse via collapse() method', () => {
        component.expanded.set(true);
        fixture.detectChanges();
        const trigger = triggerDebugElement.injector.get(DisclosureTrigger);
        trigger.collapse();
        fixture.detectChanges();
        expect(component.expanded()).toBeFalse();
        expect(contentElement.hasAttribute('hidden')).toBeTrue();
      });

      it('should toggle via toggle() method', () => {
        const trigger = triggerDebugElement.injector.get(DisclosureTrigger);
        expect(component.expanded()).toBeFalse();

        trigger.toggle();
        fixture.detectChanges();
        expect(component.expanded()).toBeTrue();

        trigger.toggle();
        fixture.detectChanges();
        expect(component.expanded()).toBeFalse();
      });
    });

    describe('Focus management (tabindex)', () => {
      beforeEach(() => setupTest());

      it('should have tabindex="0" when not disabled', () => {
        expect(triggerElement.getAttribute('tabindex')).toBe('0');
      });

      it('should have tabindex="-1" when disabled', () => {
        component.disabled.set(true);
        fixture.detectChanges();
        expect(triggerElement.getAttribute('tabindex')).toBe('-1');
      });
    });
  });

  /**
   * UNDERSTANDABLE
   * Predictable behavior, Consistent behavior
   *
   * Information and the operation of the user interface must be understandable.
   *
   * @see https://www.w3.org/WAI/fundamentals/accessibility-principles/#understandable
   */
  describe('Understandable', () => {
    describe('Predictable behavior (two-way binding)', () => {
      beforeEach(() => setupTest());

      it('should update expanded signal when toggled via pointer', () => {
        expect(component.expanded()).toBeFalse();
        pointerdown(triggerElement);
        expect(component.expanded()).toBeTrue();
      });

      it('should update expanded signal when toggled via keyboard', () => {
        expect(component.expanded()).toBeFalse();
        enter(triggerElement);
        expect(component.expanded()).toBeTrue();
      });

      it('should reflect external expanded changes in ARIA attributes', () => {
        expect(triggerElement.getAttribute('aria-expanded')).toBe('false');
        component.expanded.set(true);
        fixture.detectChanges();
        expect(triggerElement.getAttribute('aria-expanded')).toBe('true');
      });

      it('should reflect external expanded changes in content visibility', () => {
        expect(contentElement.hasAttribute('hidden')).toBeTrue();
        component.expanded.set(true);
        fixture.detectChanges();
        expect(contentElement.hasAttribute('hidden')).toBeFalse();
      });
    });

    describe('Consistent behavior (alwaysExpanded)', () => {
      beforeEach(() => {
        component = fixture.componentInstance;
        component.alwaysExpanded.set(true);
        component.expanded.set(true);
        setupTest();
      });

      it('should not collapse on pointer click when alwaysExpanded', () => {
        expect(component.expanded()).toBeTrue();
        pointerdown(triggerElement);
        expect(component.expanded()).toBeTrue();
      });

      it('should not collapse on Enter key when alwaysExpanded', () => {
        expect(component.expanded()).toBeTrue();
        enter(triggerElement);
        expect(component.expanded()).toBeTrue();
      });

      it('should not collapse on Space key when alwaysExpanded', () => {
        expect(component.expanded()).toBeTrue();
        space(triggerElement);
        expect(component.expanded()).toBeTrue();
      });
    });
  });

  /**
   * ROBUST
   * ARIA roles, ARIA states, ARIA properties
   *
   * Content must be robust enough to be interpreted reliably by a wide variety
   * of user agents, including assistive technologies.
   *
   * @see https://www.w3.org/WAI/fundamentals/accessibility-principles/#robust
   */
  describe('Robust', () => {
    describe('ARIA roles', () => {
      beforeEach(() => setupTest());

      it('should have role="button" on trigger', () => {
        expect(triggerElement.getAttribute('role')).toBe('button');
      });
    });

    describe('ARIA states (aria-expanded)', () => {
      beforeEach(() => setupTest());

      it('should have aria-expanded="false" when collapsed', () => {
        expect(triggerElement.getAttribute('aria-expanded')).toBe('false');
      });

      it('should have aria-expanded="true" when expanded', () => {
        component.expanded.set(true);
        fixture.detectChanges();
        expect(triggerElement.getAttribute('aria-expanded')).toBe('true');
      });
    });

    describe('ARIA properties (aria-controls, aria-disabled)', () => {
      beforeEach(() => setupTest());

      it('should have aria-controls pointing to the content id', () => {
        expect(triggerElement.getAttribute('aria-controls')).toBe(contentElement.id);
      });

      it('should have aria-disabled="false" when not disabled', () => {
        expect(triggerElement.getAttribute('aria-disabled')).toBe('false');
      });

      it('should have aria-disabled="true" when disabled', () => {
        component.disabled.set(true);
        fixture.detectChanges();
        expect(triggerElement.getAttribute('aria-disabled')).toBe('true');
      });
    });
  });
});

@Component({
  template: `
    <button
      ngDisclosureTrigger
      #trigger="ngDisclosureTrigger"
      [(expanded)]="expanded"
      [disabled]="disabled()"
      [alwaysExpanded]="alwaysExpanded()"
      [controls]="contentId"
    >
      Toggle Content
    </button>
    <div
      ngDisclosureContent
      [id]="contentId"
      [trigger]="trigger"
    >
      <p>Disclosure content</p>
    </div>
  `,
  imports: [DisclosureTrigger, DisclosureContent],
})
class DisclosureTestComponent {
  contentId = 'disclosure-content-test';
  expanded = signal(false);
  disabled = signal(false);
  alwaysExpanded = signal(false);
}
