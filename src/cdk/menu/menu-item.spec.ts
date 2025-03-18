import {Component, Type} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {dispatchKeyboardEvent} from '../testing/private';
import {By} from '@angular/platform-browser';
import {ENTER} from '../keycodes';
import {CdkMenuModule} from './menu-module';
import {CdkMenuItem} from './menu-item';

describe('MenuItem', () => {
  describe('with no complex inner elements', () => {
    let fixture: ComponentFixture<SingleMenuItem>;
    let menuItem: CdkMenuItem;
    let nativeButton: HTMLButtonElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(SingleMenuItem);
      fixture.detectChanges();

      menuItem = fixture.debugElement.query(By.directive(CdkMenuItem)).injector.get(CdkMenuItem);
      nativeButton = fixture.debugElement.query(By.directive(CdkMenuItem)).nativeElement;
    });

    it('should have the menuitem role', () => {
      expect(nativeButton.getAttribute('role')).toBe('menuitem');
    });

    it('should a type on the button', () => {
      expect(nativeButton.getAttribute('type')).toBe('button');
    });

    it('should toggle the aria disabled attribute', () => {
      expect(nativeButton.hasAttribute('aria-disabled')).toBeFalse();

      menuItem.disabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(nativeButton.getAttribute('aria-disabled')).toBe('true');

      menuItem.disabled = false;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(nativeButton.hasAttribute('aria-disabled')).toBeFalse();
    });

    it('should not have a menu', () => {
      expect(menuItem.hasMenu).toBeFalse();
    });

    it('should not prevent the default selection key action', () => {
      const event = dispatchKeyboardEvent(nativeButton, 'keydown', ENTER);
      fixture.detectChanges();
      expect(event.defaultPrevented).toBe(false);
    });
  });

  describe('with complex inner elements', () => {
    let menuItem: CdkMenuItem;

    /**
     * Build a component for testing and render it.
     * @param componentClass the component to create
     */
    function createComponent<T>(componentClass: Type<T>) {
      const fixture = TestBed.createComponent(componentClass);
      fixture.detectChanges();

      menuItem = fixture.debugElement.query(By.directive(CdkMenuItem)).injector.get(CdkMenuItem);
      return fixture;
    }

    it('should get the text for a simple menu item with no nested or wrapped elements', () => {
      createComponent(SingleMenuItem);
      expect(menuItem.getLabel()).toEqual('Click me!');
    });

    it('should get the text for menu item with a single nested mat icon component', () => {
      const fixture = createComponent(MenuItemWithIcon);
      expect(menuItem.getLabel()).toEqual('unicorn Click me!');
      fixture.componentInstance.typeahead = 'Click me!';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(menuItem.getLabel()).toEqual('Click me!');
    });

    it('should get the text for menu item with single nested component with the material icon class', () => {
      const fixture = createComponent(MenuItemWithIconClass);
      expect(menuItem.getLabel()).toEqual('unicorn Click me!');
      fixture.componentInstance.typeahead = 'Click me!';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(menuItem.getLabel()).toEqual('Click me!');
    });

    it('should get the text for a menu item with bold marked text', () => {
      createComponent(MenuItemWithBoldElement);
      expect(menuItem.getLabel()).toEqual('Click me!');
    });

    it('should get the text for a menu item with nested icon, nested icon class and nested wrapping elements', () => {
      const fixture = createComponent(MenuItemWithMultipleNestings);
      expect(menuItem.getLabel()).toEqual('unicorn Click menume!');
      fixture.componentInstance.typeahead = 'Click me!';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(menuItem.getLabel()).toEqual('Click me!');
    });
  });
});

@Component({
  selector: 'mat-icon',
  template: '<ng-content></ng-content>',
})
class FakeMatIcon {}

@Component({
  template: `
    <div cdkMenu>
      <button cdkMenuItem>Click me!</button>
    </div>
  `,
  imports: [CdkMenuModule],
})
class SingleMenuItem {}

@Component({
  template: `
    <div cdkMenu>
      <button cdkMenuItem [cdkMenuitemTypeaheadLabel]="typeahead">
        <mat-icon>unicorn</mat-icon>
        Click me!
      </button>
    </div>
  `,
  imports: [CdkMenuModule, FakeMatIcon],
})
class MenuItemWithIcon {
  typeahead: string;
}

@Component({
  template: `
    <div cdkMenu>
      <button cdkMenuItem [cdkMenuitemTypeaheadLabel]="typeahead">
        <div class="material-icons">unicorn</div>
        Click me!
      </button>
    </div>
  `,
  imports: [CdkMenuModule],
})
class MenuItemWithIconClass {
  typeahead: string;
}

@Component({
  template: `
    <div cdkMenu>
      <button cdkMenuItem><strong>Click</strong> me!</button>
    </div>
  `,
  imports: [CdkMenuModule],
})
class MenuItemWithBoldElement {}

@Component({
  template: `
    <div cdkMenu>
      <button cdkMenuItem [cdkMenuitemTypeaheadLabel]="typeahead">
        <div>
          <div class="material-icons">unicorn</div>
          <div>
            Click
          </div>
          <mat-icon>menu</mat-icon>
          <div>me<strong>!</strong></div>
        </div>
      </button>
    </div>
  `,
  imports: [CdkMenuModule, FakeMatIcon],
})
class MenuItemWithMultipleNestings {
  typeahead: string;
}
