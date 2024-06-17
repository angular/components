import {Directionality} from '@angular/cdk/bidi';
import {ENTER, SPACE} from '@angular/cdk/keycodes';
import {dispatchFakeEvent, dispatchKeyboardEvent} from '@angular/cdk/testing/private';
import {Component, DebugElement, ViewChild} from '@angular/core';
import {ComponentFixture, TestBed, fakeAsync, flush, waitForAsync} from '@angular/core/testing';
import {MAT_RIPPLE_GLOBAL_OPTIONS, RippleGlobalOptions} from '@angular/material/core';
import {By} from '@angular/platform-browser';
import {Subject} from 'rxjs';
import {
  MAT_CHIPS_DEFAULT_OPTIONS,
  MatChipEvent,
  MatChipListbox,
  MatChipOption,
  MatChipSelectionChange,
  MatChipsDefaultOptions,
  MatChipsModule,
} from './index';

describe('MDC-based Option Chips', () => {
  let fixture: ComponentFixture<any>;
  let chipDebugElement: DebugElement;
  let chipNativeElement: HTMLElement;
  let primaryAction: HTMLElement;
  let chipInstance: MatChipOption;
  let globalRippleOptions: RippleGlobalOptions;
  let dir = 'ltr';

  let hideSingleSelectionIndicator: boolean | undefined;

  beforeEach(waitForAsync(() => {
    globalRippleOptions = {};
    const defaultOptions: MatChipsDefaultOptions = {
      separatorKeyCodes: [ENTER, SPACE],
      hideSingleSelectionIndicator,
    };

    TestBed.configureTestingModule({
      imports: [MatChipsModule],
      providers: [
        {provide: MAT_RIPPLE_GLOBAL_OPTIONS, useFactory: () => globalRippleOptions},
        {
          provide: Directionality,
          useFactory: () => ({
            value: dir,
            change: new Subject(),
          }),
        },
        {provide: MAT_CHIPS_DEFAULT_OPTIONS, useFactory: () => defaultOptions},
      ],
      declarations: [SingleChip],
    });

    TestBed.compileComponents();
  }));

  describe('MatChipOption', () => {
    let testComponent: SingleChip;

    beforeEach(() => {
      fixture = TestBed.createComponent(SingleChip);
      fixture.detectChanges();

      chipDebugElement = fixture.debugElement.query(By.directive(MatChipOption))!;
      chipNativeElement = chipDebugElement.nativeElement;
      chipInstance = chipDebugElement.injector.get<MatChipOption>(MatChipOption);
      primaryAction = chipNativeElement.querySelector('.mdc-evolution-chip__action--primary')!;
      testComponent = fixture.debugElement.componentInstance;
    });

    describe('basic behaviors', () => {
      it('adds the `mat-chip` class', () => {
        expect(chipNativeElement.classList).toContain('mat-mdc-chip');
      });

      it('emits focus only once for multiple clicks', () => {
        let counter = 0;
        chipInstance._onFocus.subscribe(() => {
          counter++;
        });

        primaryAction.focus();
        primaryAction.focus();
        fixture.detectChanges();

        expect(counter).toBe(1);
      });

      it('emits destroy on destruction', () => {
        spyOn(testComponent, 'chipDestroy').and.callThrough();

        // Force a destroy callback
        testComponent.shouldShow = false;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(testComponent.chipDestroy).toHaveBeenCalledTimes(1);
      });

      it('allows color customization', () => {
        expect(chipNativeElement.classList).toContain('mat-primary');

        testComponent.color = 'warn';
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(chipNativeElement.classList).not.toContain('mat-primary');
        expect(chipNativeElement.classList).toContain('mat-warn');
      });

      it('allows selection', () => {
        spyOn(testComponent, 'chipSelectionChange');
        expect(chipNativeElement.classList).not.toContain('mat-mdc-chip-selected');

        testComponent.selected = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(chipNativeElement.classList).toContain('mat-mdc-chip-selected');
        expect(testComponent.chipSelectionChange).toHaveBeenCalledWith({
          source: chipInstance,
          isUserInput: false,
          selected: true,
        });
      });

      it('should not prevent the default click action', () => {
        const event = dispatchFakeEvent(chipNativeElement, 'click');
        fixture.detectChanges();

        expect(event.defaultPrevented).toBe(false);
      });

      it('should not dispatch `selectionChange` event when deselecting a non-selected chip', () => {
        chipInstance.deselect();

        const spy = jasmine.createSpy('selectionChange spy');
        const subscription = chipInstance.selectionChange.subscribe(spy);

        chipInstance.deselect();

        expect(spy).not.toHaveBeenCalled();
        subscription.unsubscribe();
      });

      it('should not dispatch `selectionChange` event when selecting a selected chip', () => {
        chipInstance.select();

        const spy = jasmine.createSpy('selectionChange spy');
        const subscription = chipInstance.selectionChange.subscribe(spy);

        chipInstance.select();

        expect(spy).not.toHaveBeenCalled();
        subscription.unsubscribe();
      });

      it(
        'should not dispatch `selectionChange` event when selecting a selected chip via ' +
          'user interaction',
        () => {
          chipInstance.select();

          const spy = jasmine.createSpy('selectionChange spy');
          const subscription = chipInstance.selectionChange.subscribe(spy);

          chipInstance.selectViaInteraction();

          expect(spy).not.toHaveBeenCalled();
          subscription.unsubscribe();
        },
      );

      it('should not dispatch `selectionChange` through setter if the value did not change', () => {
        chipInstance.selected = false;

        const spy = jasmine.createSpy('selectionChange spy');
        const subscription = chipInstance.selectionChange.subscribe(spy);

        chipInstance.selected = false;

        expect(spy).not.toHaveBeenCalled();
        subscription.unsubscribe();
      });

      it('should be able to disable ripples through ripple global options at runtime', () => {
        expect(chipInstance._isRippleDisabled())
          .withContext('Expected chip ripples to be enabled.')
          .toBe(false);

        globalRippleOptions.disabled = true;

        expect(chipInstance._isRippleDisabled())
          .withContext('Expected chip ripples to be disabled.')
          .toBe(true);
      });

      it('should have the correct role', () => {
        expect(chipNativeElement.getAttribute('role')).toBe('presentation');
      });

      it('should be able to set a custom role', () => {
        chipInstance.role = 'button';
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(chipNativeElement.getAttribute('role')).toBe('button');
      });
    });

    describe('keyboard behavior', () => {
      describe('when selectable is true', () => {
        beforeEach(() => {
          testComponent.selectable = true;
          fixture.changeDetectorRef.markForCheck();
          fixture.detectChanges();
        });

        it('should selects/deselects the currently focused chip on SPACE', () => {
          const CHIP_SELECTED_EVENT: MatChipSelectionChange = {
            source: chipInstance,
            isUserInput: true,
            selected: true,
          };

          const CHIP_DESELECTED_EVENT: MatChipSelectionChange = {
            source: chipInstance,
            isUserInput: true,
            selected: false,
          };

          spyOn(testComponent, 'chipSelectionChange');

          // Use the spacebar to select the chip
          dispatchKeyboardEvent(primaryAction, 'keydown', SPACE);
          fixture.detectChanges();

          expect(chipInstance.selected).toBeTruthy();
          expect(testComponent.chipSelectionChange).toHaveBeenCalledTimes(1);
          expect(testComponent.chipSelectionChange).toHaveBeenCalledWith(CHIP_SELECTED_EVENT);

          // Use the spacebar to deselect the chip
          dispatchKeyboardEvent(primaryAction, 'keydown', SPACE);
          fixture.detectChanges();

          expect(chipInstance.selected).toBeFalsy();
          expect(testComponent.chipSelectionChange).toHaveBeenCalledTimes(2);
          expect(testComponent.chipSelectionChange).toHaveBeenCalledWith(CHIP_DESELECTED_EVENT);
        });

        it('should have correct aria-selected in single selection mode', () => {
          expect(primaryAction.getAttribute('aria-selected')).toBe('false');

          testComponent.selected = true;
          fixture.changeDetectorRef.markForCheck();
          fixture.detectChanges();

          expect(primaryAction.getAttribute('aria-selected')).toBe('true');
        });

        it('should have the correct aria-selected in multi-selection mode', fakeAsync(() => {
          testComponent.chipList.multiple = true;
          fixture.changeDetectorRef.markForCheck();
          flush();
          fixture.detectChanges();
          expect(primaryAction.getAttribute('aria-selected')).toBe('false');

          testComponent.selected = true;
          fixture.changeDetectorRef.markForCheck();
          fixture.detectChanges();

          expect(primaryAction.getAttribute('aria-selected')).toBe('true');
        }));

        it('should disable focus on the checkmark', fakeAsync(() => {
          // The checkmark is only shown in multi selection mode.
          testComponent.chipList.multiple = true;
          fixture.changeDetectorRef.markForCheck();
          flush();
          fixture.detectChanges();

          const checkmark = chipNativeElement.querySelector('.mdc-evolution-chip__checkmark-svg')!;
          expect(checkmark.getAttribute('focusable')).toBe('false');
        }));
      });

      describe('when selectable is false', () => {
        beforeEach(() => {
          testComponent.selectable = false;
          fixture.changeDetectorRef.markForCheck();
          fixture.detectChanges();
        });

        it('SPACE ignores selection', () => {
          spyOn(testComponent, 'chipSelectionChange');

          // Use the spacebar to attempt to select the chip
          dispatchKeyboardEvent(primaryAction, 'keydown', SPACE);
          fixture.detectChanges();

          expect(chipInstance.selected).toBe(false);
          expect(testComponent.chipSelectionChange).not.toHaveBeenCalled();
        });

        it('should not have the aria-selected attribute', () => {
          expect(primaryAction.hasAttribute('aria-selected')).toBe(false);
        });
      });

      it('should update the aria-disabled for disabled chips', () => {
        expect(primaryAction.getAttribute('aria-disabled')).toBe('false');

        testComponent.disabled = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(primaryAction.getAttribute('aria-disabled')).toBe('true');
      });

      it('should display checkmark graphic by default', () => {
        expect(
          fixture.debugElement.injector.get(MAT_CHIPS_DEFAULT_OPTIONS)
            ?.hideSingleSelectionIndicator,
        )
          .withContext(
            'expected not to have a default value set for `hideSingleSelectionIndicator`',
          )
          .toBeUndefined();

        expect(chipNativeElement.querySelector('.mat-mdc-chip-graphic')).toBeTruthy();
        expect(chipNativeElement.classList).toContain('mdc-evolution-chip--with-primary-graphic');
      });
    });

    describe('a11y', () => {
      it('should apply `ariaLabel` and `ariaDesciption` to the element with option role', () => {
        testComponent.ariaLabel = 'option name';
        testComponent.ariaDescription = 'option description';
        fixture.changeDetectorRef.markForCheck();

        fixture.detectChanges();

        const optionElement = fixture.nativeElement.querySelector('[role="option"]') as HTMLElement;
        expect(optionElement)
          .withContext('expected to find an element with option role')
          .toBeTruthy();

        expect(optionElement.getAttribute('aria-label')).toMatch(/option name/i);

        const optionElementDescribedBy = optionElement!.getAttribute('aria-describedby');
        expect(optionElementDescribedBy)
          .withContext('expected primary grid cell to have a non-empty aria-describedby attribute')
          .toBeTruthy();

        const optionElementDescriptions = Array.from(
          (fixture.nativeElement as HTMLElement).querySelectorAll(
            optionElementDescribedBy!
              .split(/\s+/g)
              .map(x => `#${x}`)
              .join(','),
          ),
        );

        const optionElementDescription = optionElementDescriptions
          .map(x => x.textContent?.trim())
          .join(' ')
          .trim();

        expect(optionElementDescription).toMatch(/option description/i);
      });

      it('should display checkmark graphic by default', () => {
        expect(chipNativeElement.querySelector('.mat-mdc-chip-graphic')).toBeTruthy();
        expect(chipNativeElement.classList).toContain('mdc-evolution-chip--with-primary-graphic');
      });
    });

    describe('with token to hide single-selection checkmark indicator', () => {
      beforeAll(() => {
        hideSingleSelectionIndicator = true;
      });

      afterAll(() => {
        hideSingleSelectionIndicator = undefined;
      });

      it('does not display checkmark graphic', () => {
        expect(chipNativeElement.querySelector('.mat-mdc-chip-graphic')).toBeNull();
        expect(chipNativeElement.classList).not.toContain(
          'mdc-evolution-chip--with-primary-graphic',
        );
      });

      it('displays checkmark graphic when avatar is provided', () => {
        testComponent.selected = true;
        testComponent.avatarLabel = 'A';
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(chipNativeElement.querySelector('.mat-mdc-chip-graphic')).toBeTruthy();
        expect(chipNativeElement.classList).toContain('mdc-evolution-chip--with-primary-graphic');
      });
    });

    it('should contain a focus indicator inside the text label', () => {
      const label = chipNativeElement.querySelector('.mdc-evolution-chip__text-label');
      expect(label?.querySelector('.mat-mdc-focus-indicator')).toBeTruthy();
    });
  });
});

@Component({
  template: `
    <mat-chip-listbox>
      @if (shouldShow) {
        <div>
          <mat-chip-option [selectable]="selectable"
                  [color]="color" [selected]="selected" [disabled]="disabled"
                  (destroyed)="chipDestroy($event)"
                  (selectionChange)="chipSelectionChange($event)"
                  [aria-label]="ariaLabel" [aria-description]="ariaDescription">
            @if (avatarLabel) {
              <span class="avatar" matChipAvatar>{{avatarLabel}}</span>
            }
            {{name}}
          </mat-chip-option>
        </div>
      }
    </mat-chip-listbox>`,
})
class SingleChip {
  @ViewChild(MatChipListbox) chipList: MatChipListbox;
  disabled: boolean = false;
  name: string = 'Test';
  color: string = 'primary';
  selected: boolean = false;
  selectable: boolean = true;
  shouldShow: boolean = true;
  ariaLabel: string | null = null;
  ariaDescription: string | null = null;
  avatarLabel: string | null = null;

  chipDestroy: (event?: MatChipEvent) => void = () => {};
  chipSelectionChange: (event?: MatChipSelectionChange) => void = () => {};
}
