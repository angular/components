import {BACKSPACE, DELETE, ENTER, SPACE} from '@angular/cdk/keycodes';
import {
  createKeyboardEvent,
  dispatchEvent,
  dispatchFakeEvent,
  dispatchKeyboardEvent,
  dispatchMouseEvent,
  provideFakeDirectionality,
} from '@angular/cdk/testing/private';
import {Component, DebugElement, ElementRef, ViewChild} from '@angular/core';
import {ComponentFixture, TestBed, fakeAsync, flush, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {
  MatChipEditInput,
  MatChipEditedEvent,
  MatChipEvent,
  MatChipGrid,
  MatChipRow,
  MatChipsModule,
} from './index';

describe('Row Chips', () => {
  let fixture: ComponentFixture<any>;
  let chipDebugElement: DebugElement;
  let chipNativeElement: HTMLElement;
  let chipInstance: MatChipRow;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatChipsModule, SingleChip],
      providers: [provideFakeDirectionality('ltr')],
    });
  }));

  describe('MatChipRow', () => {
    let testComponent: SingleChip;

    beforeEach(() => {
      fixture = TestBed.createComponent(SingleChip);
      fixture.detectChanges();

      chipDebugElement = fixture.debugElement.query(By.directive(MatChipRow))!;
      chipNativeElement = chipDebugElement.nativeElement;
      chipInstance = chipDebugElement.injector.get<MatChipRow>(MatChipRow);
      testComponent = fixture.debugElement.componentInstance;
    });

    describe('basic behaviors', () => {
      it('adds the `mat-mdc-chip` class', () => {
        expect(chipNativeElement.classList).toContain('mat-mdc-chip');
      });

      it('does not add the `mat-basic-chip` class', () => {
        expect(chipNativeElement.classList).not.toContain('mat-basic-chip');
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

      it('allows removal', () => {
        spyOn(testComponent, 'chipRemove');

        chipInstance.remove();
        fixture.detectChanges();

        expect(testComponent.chipRemove).toHaveBeenCalledWith({chip: chipInstance});
      });

      it('should have a tabindex', () => {
        expect(chipNativeElement.getAttribute('tabindex')).toBe('-1');
      });

      it('should have the correct role', () => {
        expect(chipNativeElement.getAttribute('role')).toBe('row');
      });

      it('should be able to set a custom role', () => {
        chipInstance.role = 'button';
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(chipNativeElement.getAttribute('role')).toBe('button');
      });
    });

    describe('keyboard behavior', () => {
      describe('when removable is true', () => {
        beforeEach(() => {
          testComponent.removable = true;
          fixture.changeDetectorRef.markForCheck();
          fixture.detectChanges();
        });

        it('DELETE emits the (removed) event', () => {
          const DELETE_EVENT = createKeyboardEvent('keydown', DELETE);

          spyOn(testComponent, 'chipRemove');

          dispatchEvent(chipNativeElement, DELETE_EVENT);
          fixture.detectChanges();

          expect(testComponent.chipRemove).toHaveBeenCalled();
        });

        it('BACKSPACE emits the (removed) event', () => {
          const BACKSPACE_EVENT = createKeyboardEvent('keydown', BACKSPACE);

          spyOn(testComponent, 'chipRemove');

          dispatchEvent(chipNativeElement, BACKSPACE_EVENT);
          fixture.detectChanges();

          expect(testComponent.chipRemove).toHaveBeenCalled();
        });

        it('should not remove for repeated BACKSPACE event', () => {
          const BACKSPACE_EVENT = createKeyboardEvent('keydown', BACKSPACE);
          Object.defineProperty(BACKSPACE_EVENT, 'repeat', {
            get: () => true,
          });

          spyOn(testComponent, 'chipRemove');

          dispatchEvent(chipNativeElement, BACKSPACE_EVENT);
          fixture.detectChanges();

          expect(testComponent.chipRemove).not.toHaveBeenCalled();
        });
      });

      describe('when removable is false', () => {
        beforeEach(() => {
          testComponent.removable = false;
          fixture.changeDetectorRef.markForCheck();
          fixture.detectChanges();
        });

        it('DELETE does not emit the (removed) event', () => {
          const DELETE_EVENT = createKeyboardEvent('keydown', DELETE);

          spyOn(testComponent, 'chipRemove');

          dispatchEvent(chipNativeElement, DELETE_EVENT);
          fixture.detectChanges();

          expect(testComponent.chipRemove).not.toHaveBeenCalled();
        });

        it('BACKSPACE does not emit the (removed) event', () => {
          const BACKSPACE_EVENT = createKeyboardEvent('keydown', BACKSPACE);

          spyOn(testComponent, 'chipRemove');

          // Use the delete to remove the chip
          dispatchEvent(chipNativeElement, BACKSPACE_EVENT);
          fixture.detectChanges();

          expect(testComponent.chipRemove).not.toHaveBeenCalled();
        });
      });

      it('should update the aria-label for disabled chips', () => {
        const primaryActionElement = chipNativeElement.querySelector(
          '.mdc-evolution-chip__action--primary',
        )!;

        expect(primaryActionElement.getAttribute('aria-disabled')).toBe('false');

        testComponent.disabled = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(primaryActionElement.getAttribute('aria-disabled')).toBe('true');
      });

      describe('focus management', () => {
        it('sends focus to first grid cell on root chip focus', () => {
          dispatchFakeEvent(chipNativeElement, 'focus');
          fixture.detectChanges();

          expect(document.activeElement).toHaveClass('mdc-evolution-chip__action--primary');
        });

        it('emits focus only once for multiple focus() calls', () => {
          let counter = 0;
          chipInstance._onFocus.subscribe(() => {
            counter++;
          });

          chipInstance.focus();
          chipInstance.focus();
          fixture.detectChanges();

          expect(counter).toBe(1);
        });
      });
    });

    describe('editable behavior', () => {
      beforeEach(() => {
        testComponent.editable = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
      });

      it('should begin editing on double click', () => {
        expect(chipNativeElement.querySelector('.mat-chip-edit-input')).toBeFalsy();
        dispatchFakeEvent(chipNativeElement, 'dblclick');
        fixture.detectChanges();
        expect(chipNativeElement.querySelector('.mat-chip-edit-input')).toBeTruthy();
      });

      it('should begin editing on ENTER', () => {
        expect(chipNativeElement.querySelector('.mat-chip-edit-input')).toBeFalsy();
        dispatchKeyboardEvent(chipNativeElement, 'keydown', ENTER);
        fixture.detectChanges();
        expect(chipNativeElement.querySelector('.mat-chip-edit-input')).toBeTruthy();
      });

      it('should not begin editing on single click', () => {
        expect(chipNativeElement.querySelector('.mat-chip-edit-input')).toBeFalsy();
        dispatchMouseEvent(chipNativeElement, 'click');
        fixture.detectChanges();
        expect(chipNativeElement.querySelector('.mat-chip-edit-input')).toBeFalsy();
      });

      it('should begin editing on single click when focused', fakeAsync(() => {
        expect(chipNativeElement.querySelector('.mat-chip-edit-input')).toBeFalsy();
        chipNativeElement.focus();

        // Need to also simulate the mousedown as that sets the already focused flag.
        dispatchMouseEvent(chipNativeElement, 'mousedown');
        dispatchMouseEvent(chipNativeElement, 'click');
        fixture.detectChanges();
        expect(chipNativeElement.querySelector('.mat-chip-edit-input')).toBeTruthy();
      }));

      describe('when disabled', () => {
        beforeEach(() => {
          testComponent.disabled = true;
          fixture.changeDetectorRef.markForCheck();
          fixture.detectChanges();
        });

        it('should not begin editing on double click', () => {
          expect(chipNativeElement.querySelector('.mat-chip-edit-input')).toBeFalsy();
          dispatchFakeEvent(chipNativeElement, 'dblclick');
          fixture.detectChanges();
          expect(chipNativeElement.querySelector('.mat-chip-edit-input')).toBeFalsy();
        });

        it('should not begin editing on ENTER', () => {
          expect(chipNativeElement.querySelector('.mat-chip-edit-input')).toBeFalsy();
          dispatchKeyboardEvent(chipNativeElement, 'keydown', ENTER);
          fixture.detectChanges();
          expect(chipNativeElement.querySelector('.mat-chip-edit-input')).toBeFalsy();
        });

        it('should not begin editing on single click when focused', fakeAsync(() => {
          expect(chipNativeElement.querySelector('.mat-chip-edit-input')).toBeFalsy();
          chipNativeElement.focus();

          // Need to also simulate the mousedown as that sets the already focused flag.
          dispatchMouseEvent(chipNativeElement, 'mousedown');
          dispatchMouseEvent(chipNativeElement, 'click');
          fixture.detectChanges();
          expect(chipNativeElement.querySelector('.mat-chip-edit-input')).toBeFalsy();
        }));
      });

      describe('when not editable', () => {
        beforeEach(() => {
          testComponent.editable = false;
          fixture.changeDetectorRef.markForCheck();
          fixture.detectChanges();
        });

        it('should not begin editing on double click', () => {
          expect(chipNativeElement.querySelector('.mat-chip-edit-input')).toBeFalsy();
          dispatchFakeEvent(chipNativeElement, 'dblclick');
          fixture.detectChanges();
          expect(chipNativeElement.querySelector('.mat-chip-edit-input')).toBeFalsy();
        });

        it('should not begin editing on ENTER', () => {
          expect(chipNativeElement.querySelector('.mat-chip-edit-input')).toBeFalsy();
          dispatchKeyboardEvent(chipNativeElement, 'keydown', ENTER);
          fixture.detectChanges();
          expect(chipNativeElement.querySelector('.mat-chip-edit-input')).toBeFalsy();
        });

        it('should not begin editing on single click when focused', fakeAsync(() => {
          expect(chipNativeElement.querySelector('.mat-chip-edit-input')).toBeFalsy();
          chipNativeElement.focus();

          // Need to also simulate the mousedown as that sets the already focused flag.
          dispatchMouseEvent(chipNativeElement, 'mousedown');
          dispatchMouseEvent(chipNativeElement, 'click');
          fixture.detectChanges();
          expect(chipNativeElement.querySelector('.mat-chip-edit-input')).toBeFalsy();
        }));
      });
    });

    describe('editing behavior', () => {
      let editInputInstance: MatChipEditInput;
      let primaryAction: HTMLElement;

      beforeEach(fakeAsync(() => {
        testComponent.editable = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        dispatchFakeEvent(chipNativeElement, 'dblclick');
        fixture.detectChanges();
        flush();

        spyOn(testComponent, 'chipEdit');
        const editInputDebugElement = fixture.debugElement.query(By.directive(MatChipEditInput))!;
        editInputInstance = editInputDebugElement.injector.get<MatChipEditInput>(MatChipEditInput);
        primaryAction = chipNativeElement.querySelector('.mdc-evolution-chip__action--primary')!;
      }));

      function keyDownOnPrimaryAction(keyCode: number, key: string) {
        const keyDownEvent = createKeyboardEvent('keydown', keyCode, key);
        dispatchEvent(primaryAction, keyDownEvent);
        fixture.detectChanges();
      }

      function getEditInput(): HTMLElement {
        return chipNativeElement.querySelector('.mat-chip-edit-input')!;
      }

      it('should set the role of the primary action to gridcell', () => {
        testComponent.editable = false;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        expect(primaryAction.getAttribute('role')).toBe('gridcell');

        testComponent.editable = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        // Test regression of bug where element is mislabeled as a button role. Element that does not perform its
        // action on click event is not a button by ARIA spec (#27106).
        expect(primaryAction.getAttribute('role')).toBe('gridcell');
      });

      it('should not delete the chip on DELETE or BACKSPACE', () => {
        spyOn(testComponent, 'chipDestroy');
        keyDownOnPrimaryAction(DELETE, 'Delete');
        keyDownOnPrimaryAction(BACKSPACE, 'Backspace');
        expect(testComponent.chipDestroy).not.toHaveBeenCalled();
      });

      it('should stop editing on blur', fakeAsync(() => {
        chipInstance._onBlur.next();
        flush();
        expect(testComponent.chipEdit).toHaveBeenCalled();
      }));

      it('should stop editing on ENTER', fakeAsync(() => {
        dispatchKeyboardEvent(getEditInput(), 'keydown', ENTER);
        fixture.detectChanges();
        flush();
        expect(testComponent.chipEdit).toHaveBeenCalled();
      }));

      it('should emit the new chip value when editing completes', fakeAsync(() => {
        const chipValue = 'chip value';
        editInputInstance.setValue(chipValue);
        dispatchKeyboardEvent(getEditInput(), 'keydown', ENTER);
        flush();
        const expectedValue = jasmine.objectContaining({value: chipValue});
        expect(testComponent.chipEdit).toHaveBeenCalledWith(expectedValue);
      }));

      it('should use the projected edit input if provided', () => {
        expect(editInputInstance.getNativeElement()).toHaveClass('projected-edit-input');
      });

      it('should use the default edit input if none is projected', () => {
        keyDownOnPrimaryAction(ENTER, 'Enter');
        testComponent.useCustomEditInput = false;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        dispatchFakeEvent(chipNativeElement, 'dblclick');
        fixture.detectChanges();
        const editInputDebugElement = fixture.debugElement.query(By.directive(MatChipEditInput))!;
        const editInputNoProject =
          editInputDebugElement.injector.get<MatChipEditInput>(MatChipEditInput);
        expect(editInputNoProject.getNativeElement()).not.toHaveClass('projected-edit-input');
      });

      it('should focus the chip content if the edit input has focus on completion', fakeAsync(() => {
        const chipValue = 'chip value';
        editInputInstance.setValue(chipValue);
        dispatchKeyboardEvent(getEditInput(), 'keydown', ENTER);
        fixture.detectChanges();
        flush();
        expect(document.activeElement).toBe(primaryAction);
      }));

      it('should not change focus if another element has focus on completion', fakeAsync(() => {
        const chipValue = 'chip value';
        editInputInstance.setValue(chipValue);
        testComponent.chipInput.nativeElement.focus();
        keyDownOnPrimaryAction(ENTER, 'Enter');
        flush();
        expect(document.activeElement).not.toBe(primaryAction);
      }));

      it('should not prevent SPACE events when editing', fakeAsync(() => {
        const event = dispatchKeyboardEvent(getEditInput(), 'keydown', SPACE);
        fixture.detectChanges();
        flush();

        expect(event.defaultPrevented).toBe(false);
      }));
    });

    describe('_hasInteractiveActions', () => {
      it('should return true if the chip has a remove icon', () => {
        testComponent.removable = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        expect(chipInstance._hasInteractiveActions()).toBe(true);
      });

      it('should return true if the chip has an edit icon', () => {
        testComponent.editable = true;
        testComponent.showEditIcon = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        expect(chipInstance._hasInteractiveActions()).toBe(true);
      });

      it('should return true even with a non-interactive trailing icon', () => {
        testComponent.showTrailingIcon = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        expect(chipInstance._hasInteractiveActions()).toBe(true);
      });

      it('should return false if all actions are non-interactive', () => {
        // Make primary action non-interactive for testing purposes.
        chipInstance.primaryAction.isInteractive = false;
        testComponent.showTrailingIcon = true;
        testComponent.removable = false; // remove icon is interactive
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        // The trailing icon is not interactive.
        expect(chipInstance.trailingIcon.isInteractive).toBe(false);
        expect(chipInstance._hasInteractiveActions()).toBe(false);
      });
    });

    describe('with edit icon', () => {
      beforeEach(async () => {
        testComponent.showEditIcon = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
      });

      it('should begin editing on edit click', () => {
        expect(chipNativeElement.querySelector('.mat-chip-edit-input')).toBeFalsy();
        dispatchFakeEvent(chipNativeElement.querySelector('.mat-mdc-chip-edit')!, 'click');
        fixture.detectChanges();
        expect(chipNativeElement.querySelector('.mat-chip-edit-input')).toBeTruthy();
      });
    });

    describe('a11y', () => {
      it('should apply `ariaLabel` and `ariaDesciption` to the primary gridcell', () => {
        fixture.componentInstance.ariaLabel = 'chip name';
        fixture.componentInstance.ariaDescription = 'chip description';
        fixture.changeDetectorRef.markForCheck();

        fixture.detectChanges();

        const primaryGridCell = (fixture.nativeElement as HTMLElement).querySelector(
          '[role="gridcell"].mdc-evolution-chip__cell--primary.mat-mdc-chip-action',
        );
        expect(primaryGridCell)
          .withContext('expected to find the grid cell for the primary chip action')
          .toBeTruthy();

        expect(primaryGridCell!.getAttribute('aria-label')).toMatch(/chip name/i);

        const primaryGridCellDescription = primaryGridCell!.getAttribute('aria-description');
        expect(primaryGridCellDescription)
          .withContext('expected primary grid cell to have a non-empty aria-description attribute')
          .toBeTruthy();
        expect(primaryGridCellDescription).toMatch(/chip description/i);
      });
    });
  });
});

@Component({
  template: `
    <mat-chip-grid #chipGrid>
      @if (shouldShow) {
        <div>
          <mat-chip-row [removable]="removable"
                  [color]="color" [disabled]="disabled" [editable]="editable"
                  (destroyed)="chipDestroy($event)"
                  (removed)="chipRemove($event)" (edited)="chipEdit($event)"
                  [aria-label]="ariaLabel" [aria-description]="ariaDescription">
            @if (showEditIcon) {
              <button matChipEdit>edit</button>
            }
            {{name}}
            @if (removable) {
              <button matChipRemove>x</button>
            }
            @if (useCustomEditInput) {
              <span class="projected-edit-input" matChipEditInput></span>
            }
            @if (showTrailingIcon) {
              <span matChipTrailingIcon>trailing</span>
            }
          </mat-chip-row>
          <input matInput [matChipInputFor]="chipGrid" #chipInput>
        </div>
      }
    </mat-chip-grid>`,
  imports: [MatChipsModule],
})
class SingleChip {
  @ViewChild(MatChipGrid) chipList: MatChipGrid;
  @ViewChild('chipInput') chipInput: ElementRef;
  disabled: boolean = false;
  name: string = 'Test';
  color: string = 'primary';
  removable: boolean = true;
  shouldShow: boolean = true;
  editable: boolean = false;
  showEditIcon: boolean = false;
  useCustomEditInput: boolean = true;
  showTrailingIcon = false;
  ariaLabel: string | null = null;
  ariaDescription: string | null = null;

  chipDestroy: (event?: MatChipEvent) => void = () => {};
  chipRemove: (event?: MatChipEvent) => void = () => {};
  chipEdit: (event?: MatChipEditedEvent) => void = () => {};
}
