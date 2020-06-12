import {Directionality} from '@angular/cdk/bidi';
import {BACKSPACE, DELETE, RIGHT_ARROW, ENTER} from '@angular/cdk/keycodes';
import {
  createKeyboardEvent,
  createMouseEvent,
  createFakeEvent,
  dispatchFakeEvent,
} from '@angular/cdk/testing/private';
import {Component, DebugElement, ViewChild} from '@angular/core';
import {async, ComponentFixture, TestBed, flush, fakeAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Subject} from 'rxjs';
import {
  MatChipEditedEvent,
  MatChipEvent,
  MatChipGrid,
  MatChipRemove,
  MatChipRow,
  MatChipsModule,
} from './index';


describe('MDC-based Row Chips', () => {
  let fixture: ComponentFixture<any>;
  let chipDebugElement: DebugElement;
  let chipNativeElement: HTMLElement;
  let chipInstance: MatChipRow;
  let removeIconInstance: MatChipRemove;

  let dir = 'ltr';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatChipsModule],
      declarations: [SingleChip],
      providers: [
        {provide: Directionality, useFactory: () => ({
          value: dir,
          change: new Subject()
        })},
      ]
    });

    TestBed.compileComponents();
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

      const removeIconDebugElement = fixture.debugElement.query(By.directive(MatChipRemove))!;
      removeIconInstance = removeIconDebugElement.injector.get<MatChipRemove>(MatChipRemove);
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
        fixture.detectChanges();

        expect(testComponent.chipDestroy).toHaveBeenCalledTimes(1);
      });

      it('allows color customization', () => {
        expect(chipNativeElement.classList).toContain('mat-primary');

        testComponent.color = 'warn';
        fixture.detectChanges();

        expect(chipNativeElement.classList).not.toContain('mat-primary');
        expect(chipNativeElement.classList).toContain('mat-warn');
      });

      it('allows removal', () => {
        spyOn(testComponent, 'chipRemove');

        chipInstance.remove();
        fixture.detectChanges();

        const fakeEvent = createFakeEvent('transitionend');
        (fakeEvent as any).propertyName = 'width';
        chipNativeElement.dispatchEvent(fakeEvent);

        expect(testComponent.chipRemove).toHaveBeenCalledWith({chip: chipInstance});
      });

      it('should prevent the default click action', () => {
        const event = dispatchFakeEvent(chipNativeElement, 'mousedown');
        fixture.detectChanges();

        expect(event.defaultPrevented).toBe(true);
      });
    });

    describe('keyboard behavior', () => {
      describe('when removable is true', () => {
        beforeEach(() => {
          testComponent.removable = true;
          fixture.detectChanges();
        });

        it('DELETE emits the (removed) event', () => {
          const DELETE_EVENT = createKeyboardEvent('keydown', DELETE) as KeyboardEvent;

          spyOn(testComponent, 'chipRemove');

          chipInstance._keydown(DELETE_EVENT);
          fixture.detectChanges();

          const fakeEvent = createFakeEvent('transitionend');
          (fakeEvent as any).propertyName = 'width';
          chipNativeElement.dispatchEvent(fakeEvent);

          expect(testComponent.chipRemove).toHaveBeenCalled();
        });

        it('BACKSPACE emits the (removed) event', () => {
          const BACKSPACE_EVENT = createKeyboardEvent('keydown', BACKSPACE) as KeyboardEvent;

          spyOn(testComponent, 'chipRemove');

          chipInstance._keydown(BACKSPACE_EVENT);
          fixture.detectChanges();

          const fakeEvent = createFakeEvent('transitionend');
          (fakeEvent as any).propertyName = 'width';
          chipNativeElement.dispatchEvent(fakeEvent);

          expect(testComponent.chipRemove).toHaveBeenCalled();
        });

        it('arrow key navigation does not emit the (removed) event', () => {
          const ARROW_KEY_EVENT = createKeyboardEvent('keydown', RIGHT_ARROW) as KeyboardEvent;

          spyOn(testComponent, 'chipRemove');

          removeIconInstance.interaction.next(ARROW_KEY_EVENT);
          fixture.detectChanges();

          const fakeEvent = createFakeEvent('transitionend');
          (fakeEvent as any).propertyName = 'width';
          chipNativeElement.dispatchEvent(fakeEvent);

          expect(testComponent.chipRemove).not.toHaveBeenCalled();
        });
      });

      describe('when removable is false', () => {
        beforeEach(() => {
          testComponent.removable = false;
          fixture.detectChanges();
        });

        it('DELETE does not emit the (removed) event', () => {
          const DELETE_EVENT = createKeyboardEvent('keydown', DELETE) as KeyboardEvent;

          spyOn(testComponent, 'chipRemove');

          chipInstance._keydown(DELETE_EVENT);
          fixture.detectChanges();

          const fakeEvent = createFakeEvent('transitionend');
          (fakeEvent as any).propertyName = 'width';
          chipNativeElement.dispatchEvent(fakeEvent);

          expect(testComponent.chipRemove).not.toHaveBeenCalled();
        });

        it('BACKSPACE does not emit the (removed) event', () => {
          const BACKSPACE_EVENT = createKeyboardEvent('keydown', BACKSPACE) as KeyboardEvent;

          spyOn(testComponent, 'chipRemove');

          // Use the delete to remove the chip
          chipInstance._keydown(BACKSPACE_EVENT);
          fixture.detectChanges();

          const fakeEvent = createFakeEvent('transitionend');
          (fakeEvent as any).propertyName = 'width';
          chipNativeElement.dispatchEvent(fakeEvent);

          expect(testComponent.chipRemove).not.toHaveBeenCalled();
        });
      });

      it('should update the aria-label for disabled chips', () => {
        expect(chipNativeElement.getAttribute('aria-disabled')).toBe('false');

        testComponent.disabled = true;
        fixture.detectChanges();

        expect(chipNativeElement.getAttribute('aria-disabled')).toBe('true');
      });

      describe('focus management', () => {
        it('sends focus to first grid cell on mousedown', () => {
          dispatchFakeEvent(chipNativeElement, 'mousedown');
          fixture.detectChanges();

          expect(document.activeElement!.classList.contains('mat-chip-row-focusable-text-content'))
              .toBe(true);
        });

        it('emits focus only once for multiple focus() calls', () => {
          let counter = 0;
          chipInstance._onFocus.subscribe(() => {
            counter ++ ;
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
        fixture.detectChanges();
      });

      it('should apply the mdc-chip--editable class', () => {
        expect(chipNativeElement.classList).toContain('mdc-chip--editable');
      });

      it('should begin editing on double click', () => {
        chipInstance._dblclick(createMouseEvent('dblclick'));
        expect(chipNativeElement.classList).toContain('mdc-chip--editing');
      });

      it('should begin editing on ENTER', () => {
        chipInstance.focus();
        const primaryActionElement = chipNativeElement.querySelector('.mdc-chip__primary-action')!;
        chipInstance._keydown(createKeyboardEvent('keydown', ENTER, 'Enter', primaryActionElement));
        expect(chipNativeElement.classList).toContain('mdc-chip--editing');
      });
    });

    describe('editing behavior', () => {
      beforeEach(() => {
        testComponent.editable = true;
        fixture.detectChanges();
        chipInstance._dblclick(createMouseEvent('dblclick'));
        spyOn(testComponent, 'chipEdit');
      });

      function keyDownOnPrimaryAction(keyCode: number, key: string) {
        const primaryActionElement = chipNativeElement.querySelector('.mdc-chip__primary-action')!;
        chipInstance._keydown(createKeyboardEvent('keydown', keyCode, key, primaryActionElement));
      }

      it('should not delete the chip on DELETE or BACKSPACE', () => {
        spyOn(testComponent, 'chipDestroy');
        keyDownOnPrimaryAction(DELETE, 'Delete');
        keyDownOnPrimaryAction(BACKSPACE, 'Backspace');
        expect(testComponent.chipDestroy).not.toHaveBeenCalled();
      });

      it('should ignore mousedown events', () => {
        spyOn(testComponent, 'chipFocus');
        chipInstance._mousedown(createMouseEvent('mousedown'));
        expect(testComponent.chipFocus).not.toHaveBeenCalled();
      });

      it('should stop editing on focusout', fakeAsync(() => {
        const fakeFocusOutEvent = {
          type: 'focusout',
          target: chipNativeElement.querySelector('.mdc-chip__primary-action')!,
        } as unknown as FocusEvent;
        chipInstance._focusout(fakeFocusOutEvent);
        flush();
        expect(chipNativeElement.classList).not.toContain('mdc-chip--editing');
        expect(testComponent.chipEdit).toHaveBeenCalled();
      }));

      it('should stop editing on ENTER', () => {
        keyDownOnPrimaryAction(ENTER, 'Enter');
        expect(chipNativeElement.classList).not.toContain('mdc-chip--editing');
        expect(testComponent.chipEdit).toHaveBeenCalled();
      });

      it('should emit the new chip value when editing completes', () => {
        const chipValue = 'chip value';
        chipInstance._onInputUpdated(chipValue);
        keyDownOnPrimaryAction(ENTER, 'Enter');
        const expectedValue = jasmine.objectContaining({value: chipValue});
        expect(testComponent.chipEdit).toHaveBeenCalledWith(expectedValue);
      });
    });
  });
});

@Component({
  template: `
    <mat-chip-grid #chipGrid>
      <div *ngIf="shouldShow">
        <mat-chip-row [removable]="removable"
                 [color]="color" [disabled]="disabled" [editable]="editable"
                 (focus)="chipFocus($event)" (destroyed)="chipDestroy($event)"
                 (removed)="chipRemove($event)" (edited)="chipEdit($event)">
          {{name}}
          <button matChipRemove>x</button>
        </mat-chip-row>
        <input matInput [matChipInputFor]="chipGrid">
      </div>
    </mat-chip-grid>`
})
class SingleChip {
  @ViewChild(MatChipGrid) chipList: MatChipGrid;
  disabled: boolean = false;
  name: string = 'Test';
  color: string = 'primary';
  removable: boolean = true;
  shouldShow: boolean = true;
  editable: boolean = false;

  chipFocus: (event?: MatChipEvent) => void = () => {};
  chipDestroy: (event?: MatChipEvent) => void = () => {};
  chipRemove: (event?: MatChipEvent) => void = () => {};
  chipEdit: (event?: MatChipEditedEvent) => void = () => {};
}
