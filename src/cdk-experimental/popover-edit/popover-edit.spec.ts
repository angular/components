import {BidiModule, Direction} from '@angular/cdk/bidi';
import {DataSource} from '@angular/cdk/collections';
import {DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW, TAB, UP_ARROW} from '@angular/cdk/keycodes';
import {CdkTableModule} from '@angular/cdk/table';
import {dispatchKeyboardEvent} from '@angular/cdk/testing/private';
import {
  ChangeDetectorRef,
  Component,
  Directive,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import {ComponentFixture, TestBed, fakeAsync, flush, tick} from '@angular/core/testing';
import {FormsModule, NgForm} from '@angular/forms';
import {BehaviorSubject} from 'rxjs';

import {
  CdkPopoverEditColspan,
  CdkPopoverEditModule,
  FormValueContainer,
  HoverContentState,
  PopoverEditClickOutBehavior,
} from './index';

const NAME_EDIT_TEMPLATE = `
    <div style="background-color: white;">
      <form #f="ngForm"
          cdkEditControl
          (ngSubmit)="onSubmit(element, f)"
          [(cdkEditControlPreservedFormValue)]="preservedValues.for(element).value"
          [cdkEditControlIgnoreSubmitUnlessValid]="ignoreSubmitUnlessValid"
          [cdkEditControlClickOutBehavior]="clickOutBehavior">
        <input [ngModel]="element.name" name="name" required>
        <input [ngModel]="element.weight" name="weight">
        <br>
        <button class="submit" type="submit">Confirm</button>
        <button class="revert" cdkEditRevert>Revert</button>
        <button class="close" cdkEditClose>Close</button>
      </form>
    </div>
    `;

const WEIGHT_EDIT_TEMPLATE = `
    <div>
      <form #f="ngForm" cdkEditControl>
        <input>
      </form>
    </div>
    `;

const CELL_TEMPLATE = `
    {{element.name}}

    <span *cdkRowHoverContent>
      <button class="open" cdkEditOpen>Edit</button>
    </span>
    `;

const POPOVER_EDIT_DIRECTIVE_NAME = `
    [cdkPopoverEdit]="nameEdit"
    [cdkPopoverEditColspan]="colspan"
    [cdkPopoverEditDisabled]="nameEditDisabled"
    [cdkPopoverEditAriaLabel]="nameEditAriaLabel"
    `;

const POPOVER_EDIT_DIRECTIVE_WEIGHT = `[cdkPopoverEdit]="weightEdit" cdkPopoverEditTabOut`;

interface PeriodicElement {
  name: string;
  weight: number;
}

@Directive()
abstract class BaseTestComponent {
  @ViewChild('table') table: ElementRef;

  preservedValues = new FormValueContainer<PeriodicElement, {'name': string}>();
  nameEditDisabled = false;
  nameEditAriaLabel: string | undefined = undefined;
  ignoreSubmitUnlessValid = true;
  clickOutBehavior: PopoverEditClickOutBehavior = 'close';
  colspan: CdkPopoverEditColspan = {};
  direction: Direction = 'ltr';
  cdr = inject(ChangeDetectorRef);

  constructor() {
    this.renderData();
  }

  abstract renderData(): void;

  onSubmit(element: PeriodicElement, form: NgForm) {
    if (!form.valid) {
      return;
    }

    element.name = form.value['name'];
  }

  triggerHoverState(rowIndex = 0) {
    const row = getRows(this.table.nativeElement)[rowIndex];
    row.dispatchEvent(new Event('mouseover', {bubbles: true}));
    row.dispatchEvent(new Event('mousemove', {bubbles: true}));

    // Wait for the mouse hover debounce in edit-event-dispatcher.
    tick(41);
  }

  getRows() {
    return getRows(this.table.nativeElement);
  }

  getEditCell(rowIndex = 0, cellIndex = 1) {
    const row = this.getRows()[rowIndex];
    return getCells(row)[cellIndex];
  }

  focusEditCell(rowIndex = 0, cellIndex = 1) {
    this.getEditCell(rowIndex, cellIndex).focus();
  }

  hoverContentStateForRow(rowIndex = 0) {
    const openButton = this.getOpenButton(rowIndex);

    if (!openButton) {
      return HoverContentState.OFF;
    }
    return parseInt(getComputedStyle(openButton.parentNode as Element).opacity || '', 10) === 0
      ? HoverContentState.FOCUSABLE
      : HoverContentState.ON;
  }

  getOpenButton(rowIndex = 0) {
    return this.getEditCell(rowIndex).querySelector('.open') as HTMLElement | null;
  }

  clickOpenButton(rowIndex = 0) {
    this.getOpenButton(rowIndex)!.click();
  }

  openLens(rowIndex = 0, cellIndex = 1) {
    this.focusEditCell(rowIndex, cellIndex);
    this.getEditCell(rowIndex, cellIndex).dispatchEvent(
      new KeyboardEvent('keydown', {bubbles: true, key: 'Enter'}),
    );
    flush();
  }

  getEditPane() {
    return document.querySelector('.cdk-edit-pane');
  }

  getEditBoundingBox() {
    return document.querySelector('.cdk-overlay-connected-position-bounding-box');
  }

  getNameInput() {
    return document.querySelector('input[name="name"]') as HTMLInputElement | null;
  }

  getWeightInput() {
    return document.querySelector('input[name="weight"]') as HTMLInputElement | null;
  }

  lensIsOpen() {
    return !!this.getNameInput();
  }

  getSubmitButton() {
    return document.querySelector('.submit') as HTMLElement | null;
  }

  clickSubmitButton() {
    this.getSubmitButton()!.click();
  }

  getRevertButton() {
    return document.querySelector('.revert') as HTMLElement | null;
  }

  clickRevertButton() {
    this.getRevertButton()!.click();
  }

  getCloseButton() {
    return document.querySelector('.close') as HTMLElement | null;
  }

  clickCloseButton() {
    this.getCloseButton()!.click();
  }
}

@Component({
  template: `
  <table #table editable [dir]="direction">
    <ng-template #nameEdit let-element>
      ${NAME_EDIT_TEMPLATE}
    </ng-template>

    <ng-template #weightEdit let-element>
      ${WEIGHT_EDIT_TEMPLATE}
    </ng-template>

    @for (element of elements; track element) {
      <tr>
        <td> just a cell </td>

        <td ${POPOVER_EDIT_DIRECTIVE_NAME}
            [cdkPopoverEditContext]="element">
          ${CELL_TEMPLATE}
        </td>

        <td ${POPOVER_EDIT_DIRECTIVE_WEIGHT}>
          {{element.weight}}
        </td>
      </tr>
    }
  </table>
  `,
  standalone: false,
})
class VanillaTableOutOfCell extends BaseTestComponent {
  elements: ChemicalElement[];

  renderData() {
    this.elements = createElementData();
    this.cdr.markForCheck();
  }
}

@Component({
  template: `
  <table #table editable [dir]="direction">
    @for (element of elements; track element) {
      <tr>
        <td> just a cell </td>

        <td ${POPOVER_EDIT_DIRECTIVE_NAME}>
          ${CELL_TEMPLATE}

          <ng-template #nameEdit>
            ${NAME_EDIT_TEMPLATE}
          </ng-template>
        </td>

        <td ${POPOVER_EDIT_DIRECTIVE_WEIGHT}>
          {{element.weight}}

          <ng-template #weightEdit>
            ${WEIGHT_EDIT_TEMPLATE}
          </ng-template>
        </td>
      </tr>
    }
  </table>
  `,
  standalone: false,
})
class VanillaTableInCell extends BaseTestComponent {
  elements: ChemicalElement[];

  renderData() {
    this.elements = createElementData();
    this.cdr.markForCheck();
  }
}

class ElementDataSource extends DataSource<PeriodicElement> {
  /** Stream of data that is provided to the table. */
  data = new BehaviorSubject(createElementData());

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect() {
    return this.data;
  }

  disconnect() {}
}

@Component({
  template: `
  <div #table [dir]="direction">
    <cdk-table cdk-table editable [dataSource]="dataSource">
      <ng-container cdkColumnDef="before">
        <cdk-cell *cdkCellDef="let element">
          just a cell
        </cdk-cell>
      </ng-container>

      <ng-container cdkColumnDef="name">
        <cdk-cell *cdkCellDef="let element"
            ${POPOVER_EDIT_DIRECTIVE_NAME}>
          ${CELL_TEMPLATE}

          <ng-template #nameEdit>
            ${NAME_EDIT_TEMPLATE}
          </ng-template>

          <span *cdkIfRowHovered>
            <button cdkEditOpen>Edit</button>
          </span>
        </cdk-cell>
      </ng-container>

      <ng-container cdkColumnDef="weight">
        <cdk-cell *cdkCellDef="let element"
            ${POPOVER_EDIT_DIRECTIVE_WEIGHT}>
          {{element.weight}}

          <ng-template #weightEdit>
            ${WEIGHT_EDIT_TEMPLATE}
          </ng-template>
        </cdk-cell>
      </ng-container>

      <cdk-row *cdkRowDef="let row; columns: displayedColumns;"></cdk-row>
    </cdk-table>
  </div>
  `,
  standalone: false,
})
class CdkFlexTableInCell extends BaseTestComponent {
  displayedColumns = ['before', 'name', 'weight'];
  dataSource: ElementDataSource;

  renderData() {
    this.dataSource = new ElementDataSource();
    this.cdr.markForCheck();
  }
}

@Component({
  template: `
  <div #table [dir]="direction">
    <table cdk-table editable [dataSource]="dataSource">
      <ng-container cdkColumnDef="before">
        <td cdk-cell *cdkCellDef="let element">
          just a cell
        </td>
      </ng-container>

      <ng-container cdkColumnDef="name">
        <td cdk-cell *cdkCellDef="let element"
            ${POPOVER_EDIT_DIRECTIVE_NAME}>
          ${CELL_TEMPLATE}

          <ng-template #nameEdit>
            ${NAME_EDIT_TEMPLATE}
          </ng-template>

          <span *cdkIfRowHovered>
            <button cdkEditOpen>Edit</button>
          </span>
        </td>
      </ng-container>

      <ng-container cdkColumnDef="weight">
        <td cdk-cell *cdkCellDef="let element"
            ${POPOVER_EDIT_DIRECTIVE_WEIGHT}>
          {{element.weight}}

          <ng-template #weightEdit>
            ${WEIGHT_EDIT_TEMPLATE}
          </ng-template>
        </td>
      </ng-container>

      <tr cdk-row *cdkRowDef="let row; columns: displayedColumns;"></tr>
    </table>
  <div>
  `,
  standalone: false,
})
class CdkTableInCell extends BaseTestComponent {
  displayedColumns = ['before', 'name', 'weight'];
  dataSource: ElementDataSource;

  renderData() {
    this.dataSource = new ElementDataSource();
    this.cdr.markForCheck();
  }
}

const testCases = [
  [VanillaTableOutOfCell, 'Vanilla HTML table; edit defined outside of cell'],
  [VanillaTableInCell, 'Vanilla HTML table; edit defined within cell'],
  [CdkFlexTableInCell, 'Flex cdk-table; edit defined within cell'],
  [CdkTableInCell, 'Table cdk-table; edit defined within cell'],
] as const;

describe('CDK Popover Edit', () => {
  for (const [componentClass, label] of testCases) {
    describe(label, () => {
      let component: BaseTestComponent;
      let fixture: ComponentFixture<BaseTestComponent>;

      beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
          imports: [CdkTableModule, CdkPopoverEditModule, FormsModule, BidiModule],
          declarations: [componentClass],
        });
        fixture = TestBed.createComponent<BaseTestComponent>(componentClass);
        component = fixture.componentInstance;
        component.renderData();
        fixture.detectChanges();
        tick(10);
        fixture.detectChanges();
      }));

      describe('row hover content', () => {
        it('makes the first and last rows focusable but invisible', fakeAsync(() => {
          const rows = component.getRows();

          expect(component.hoverContentStateForRow(0)).toBe(HoverContentState.FOCUSABLE);
          expect(component.hoverContentStateForRow(rows.length - 1)).toBe(
            HoverContentState.FOCUSABLE,
          );
        }));

        it('shows and hides on-hover content only after a delay', fakeAsync(() => {
          const [row0, row1] = component.getRows();
          row0.dispatchEvent(new Event('mouseover', {bubbles: true}));
          row0.dispatchEvent(new Event('mousemove', {bubbles: true}));

          expect(component.hoverContentStateForRow(0)).toBe(HoverContentState.FOCUSABLE);

          tick(20);
          row0.dispatchEvent(new Event('mousemove', {bubbles: true}));
          tick(20);

          expect(component.hoverContentStateForRow(0)).toBe(HoverContentState.FOCUSABLE);

          tick(31);

          expect(component.hoverContentStateForRow(0)).toBe(HoverContentState.ON);

          row1.dispatchEvent(new Event('mouseover', {bubbles: true}));
          row1.dispatchEvent(new Event('mousemove', {bubbles: true}));

          expect(component.hoverContentStateForRow(0)).toBe(HoverContentState.ON);
          expect(component.hoverContentStateForRow(1)).toBe(HoverContentState.OFF);

          tick(41);

          expect(component.hoverContentStateForRow(0)).toBe(HoverContentState.FOCUSABLE);
          expect(component.hoverContentStateForRow(1)).toBe(HoverContentState.ON);
        }));

        it('shows the hover content if the data changes after initialization', fakeAsync(() => {
          fixture.componentInstance.renderData();
          fixture.detectChanges();

          const row = component.getRows()[0];
          row.dispatchEvent(new Event('mouseover', {bubbles: true}));
          row.dispatchEvent(new Event('mousemove', {bubbles: true}));

          tick(20);
          row.dispatchEvent(new Event('mousemove', {bubbles: true}));
          tick(50);

          expect(component.hoverContentStateForRow(0)).toBe(HoverContentState.ON);
        }));

        it('shows hover content for the focused row and makes the rows above and below focusable', fakeAsync(() => {
          expect(component.hoverContentStateForRow(1)).toBe(HoverContentState.OFF);
          expect(component.hoverContentStateForRow(2)).toBe(HoverContentState.OFF);
          expect(component.hoverContentStateForRow(3)).toBe(HoverContentState.OFF);
          expect(component.hoverContentStateForRow(4)).toBe(HoverContentState.FOCUSABLE);

          component.focusEditCell(2);
          tick(1);

          expect(component.hoverContentStateForRow(2)).toBe(HoverContentState.ON);
          expect(component.hoverContentStateForRow(1)).toBe(HoverContentState.FOCUSABLE);
          expect(component.hoverContentStateForRow(3)).toBe(HoverContentState.FOCUSABLE);

          component.focusEditCell(4);
          tick(1);

          expect(component.hoverContentStateForRow(2)).toBe(HoverContentState.OFF);
          expect(component.hoverContentStateForRow(4)).toBe(HoverContentState.ON);
          expect(component.hoverContentStateForRow(3)).toBe(HoverContentState.FOCUSABLE);

          component.getEditCell(4).blur();
          tick(1);

          expect(component.hoverContentStateForRow(1)).toBe(HoverContentState.OFF);
          expect(component.hoverContentStateForRow(2)).toBe(HoverContentState.OFF);
          expect(component.hoverContentStateForRow(3)).toBe(HoverContentState.OFF);
          expect(component.hoverContentStateForRow(4)).toBe(HoverContentState.FOCUSABLE);
        }));

        it('should close the focus content when pressing escape', fakeAsync(() => {
          expect(component.hoverContentStateForRow(2)).toBe(HoverContentState.OFF);

          component.focusEditCell(2);
          tick(1);

          expect(component.hoverContentStateForRow(2)).toBe(HoverContentState.ON);

          const event = new KeyboardEvent('keydown', {bubbles: true, key: 'Escape'});
          component.getEditCell(2).dispatchEvent(event);
          tick(1);

          expect(component.hoverContentStateForRow(2)).toBe(HoverContentState.OFF);
        }));

        it(
          'shows hover content for the editing row and makes the rows above and below ' +
            'focusable unless focus is in a different table row in which case it takes priority',
          fakeAsync(() => {
            expect(component.hoverContentStateForRow(1)).toBe(HoverContentState.OFF);
            expect(component.hoverContentStateForRow(2)).toBe(HoverContentState.OFF);
            expect(component.hoverContentStateForRow(3)).toBe(HoverContentState.OFF);
            expect(component.hoverContentStateForRow(4)).toBe(HoverContentState.FOCUSABLE);

            component.openLens(2);
            tick(1);

            expect(component.hoverContentStateForRow(2)).toBe(HoverContentState.ON);
            expect(component.hoverContentStateForRow(1)).toBe(HoverContentState.FOCUSABLE);
            expect(component.hoverContentStateForRow(3)).toBe(HoverContentState.FOCUSABLE);

            component.focusEditCell(4);
            tick(1);

            expect(component.hoverContentStateForRow(2)).toBe(HoverContentState.OFF);
            expect(component.hoverContentStateForRow(4)).toBe(HoverContentState.ON);
            expect(component.hoverContentStateForRow(3)).toBe(HoverContentState.FOCUSABLE);
          }),
        );
      });

      describe('triggering edit', () => {
        it('opens edit from on-hover button', fakeAsync(() => {
          component.triggerHoverState();
          component.clickOpenButton();

          expect(component.lensIsOpen()).toBe(true);
          clearLeftoverTimers();
        }));

        it('opens edit from Enter on focued cell', fakeAsync(() => {
          // Uses Enter to open the lens.
          component.openLens();
          fixture.detectChanges();

          expect(component.lensIsOpen()).toBe(true);
          clearLeftoverTimers();
        }));

        it('does not trigger edit when disabled', fakeAsync(() => {
          component.nameEditDisabled = true;
          fixture.changeDetectorRef.markForCheck();
          fixture.detectChanges();

          // Uses Enter to open the lens.
          component.openLens();
          fixture.detectChanges();

          expect(component.lensIsOpen()).toBe(false);
          clearLeftoverTimers();
        }));

        it('sets aria label and role dialog on the popup', fakeAsync(() => {
          component.nameEditAriaLabel = 'Label of name!!';
          fixture.changeDetectorRef.markForCheck();
          fixture.detectChanges();

          // Uses Enter to open the lens.
          component.openLens();
          fixture.detectChanges();

          expect(component.lensIsOpen()).toBe(true);
          const dialogElem = component.getEditPane()!;
          expect(dialogElem.getAttribute('aria-label')).toBe('Label of name!!');
          expect(dialogElem.getAttribute('role')).toBe('dialog');
          clearLeftoverTimers();
        }));
      });

      describe('focus manipulation', () => {
        const getRowCells = () => component.getRows().map(getCells);

        describe('tabindex', () => {
          it('sets tabindex to 0 on editable cells', () => {
            expect(component.getEditCell().getAttribute('tabindex')).toBe('0');
          });

          it('unsets tabindex to 0 on disabled cells', () => {
            component.nameEditDisabled = true;
            fixture.changeDetectorRef.markForCheck();
            fixture.detectChanges();

            expect(component.getEditCell().hasAttribute('tabindex')).toBe(false);
          });
        });

        describe('arrow keys', () => {
          const dispatchKey = (cell: HTMLElement, keyCode: number) =>
            dispatchKeyboardEvent(cell, 'keydown', keyCode);

          it('moves focus up/down/left/right and prevents default', () => {
            const rowCells = getRowCells();

            // Focus the upper-left editable cell.
            rowCells[0][1].focus();

            const downEvent = dispatchKey(rowCells[0][1], DOWN_ARROW);
            expect(document.activeElement).toBe(rowCells[1][1]);
            expect(downEvent.defaultPrevented).toBe(true);

            const rightEvent = dispatchKey(rowCells[1][1], RIGHT_ARROW);
            expect(document.activeElement).toBe(rowCells[1][2]);
            expect(rightEvent.defaultPrevented).toBe(true);

            const upEvent = dispatchKey(rowCells[1][2], UP_ARROW);
            expect(document.activeElement).toBe(rowCells[0][2]);
            expect(upEvent.defaultPrevented).toBe(true);

            const leftEvent = dispatchKey(rowCells[0][2], LEFT_ARROW);
            expect(document.activeElement).toBe(rowCells[0][1]);
            expect(leftEvent.defaultPrevented).toBe(true);
          });

          it('wraps around when reaching start or end of a row, skipping non-editable cells', () => {
            const rowCells = getRowCells();

            // Focus the upper-right editable cell.
            rowCells[0][2].focus();

            dispatchKey(rowCells[0][2], RIGHT_ARROW);
            expect(document.activeElement).toBe(rowCells[1][1]);

            dispatchKey(rowCells[1][1], LEFT_ARROW);
            expect(document.activeElement).toBe(rowCells[0][2]);
          });

          it('does not fall off top or bottom of the table', () => {
            const rowCells = getRowCells();

            // Focus the upper-left editable cell.
            rowCells[0][1].focus();

            dispatchKey(rowCells[0][1], UP_ARROW);
            expect(document.activeElement).toBe(rowCells[0][1]);

            // Focus the bottom-left editable cell.
            rowCells[4][1].focus();
            dispatchKey(rowCells[4][1], DOWN_ARROW);
            expect(document.activeElement).toBe(rowCells[4][1]);
          });

          it('ignores non arrow key events', () => {
            component.focusEditCell();
            const cell = component.getEditCell();

            expect(dispatchKey(cell, TAB).defaultPrevented).toBe(false);
          });
        });

        describe('lens focus trapping behavior', () => {
          const getFocusablePaneElements = () =>
            Array.from(
              component
                .getEditBoundingBox()!
                .querySelectorAll('input, button, .cdk-focus-trap-anchor'),
            ) as HTMLElement[];

          it('keeps focus within the lens by default', fakeAsync(() => {
            // Open the name lens which has the default behavior.
            component.openLens();
            fixture.detectChanges();

            const focusableElements = getFocusablePaneElements();

            // Focus the last element (end focus trap anchor).
            focusableElements[focusableElements.length - 1].focus();
            flush();

            // Focus should have moved to the top of the lens.
            expect(document.activeElement).toBe(focusableElements[1]);
            expect(component.lensIsOpen()).toBe(true);
            clearLeftoverTimers();
          }));

          it('moves focus to the next cell when focus leaves end of lens with cdkPopoverEditTabOut', fakeAsync(() => {
            // Open the weight lens which has tab out behavior.
            component.openLens(0, 2);

            const focusableElements = getFocusablePaneElements();

            // Focus the last element (end focus trap anchor).
            focusableElements[focusableElements.length - 1].focus();
            flush();

            // Focus should have moved to the next editable cell.
            expect(document.activeElement).toBe(component.getEditCell(1, 1));
            expect(component.lensIsOpen()).toBe(false);
            clearLeftoverTimers();
          }));

          it(`moves focus to the previous cell when focus leaves end of lens with
cdkPopoverEditTabOut`, fakeAsync(() => {
            // Open the weight lens which has tab out behavior.
            component.openLens(0, 2);

            const focusableElements = getFocusablePaneElements();

            // Focus the first (start focus trap anchor).
            focusableElements[0].focus();
            flush();

            // Focus should have moved to the next editable cell.
            expect(document.activeElement).toBe(component.getEditCell(0, 1));
            expect(component.lensIsOpen()).toBe(false);
            clearLeftoverTimers();
          }));
        });
      });

      describe('edit lens', () => {
        function expectPixelsToEqual(actual: number, expected: number) {
          expect(Math.floor(actual)).toBe(Math.floor(expected));
        }

        it('shows a lens with the value from the table', fakeAsync(() => {
          component.openLens();
          fixture.detectChanges();

          expect(component.getNameInput()!.value).toBe('Hydrogen');
          clearLeftoverTimers();
        }));

        it('positions the lens at the top left corner and spans the full width of the cell', fakeAsync(() => {
          component.openLens();
          fixture.detectChanges();

          const paneRect = component.getEditPane()!.getBoundingClientRect();
          const cellRect = component.getEditCell().getBoundingClientRect();

          expectPixelsToEqual(paneRect.width, cellRect.width);
          expectPixelsToEqual(paneRect.left, cellRect.left);
          expectPixelsToEqual(paneRect.top, cellRect.top);
          clearLeftoverTimers();
        }));

        it('adjusts the positioning of the lens based on colspan', fakeAsync(() => {
          const cellRects = getCells(getRows(component.table.nativeElement)[0]).map(cell =>
            cell.getBoundingClientRect(),
          );

          component.colspan = {before: 1};
          fixture.changeDetectorRef.markForCheck();
          fixture.detectChanges();

          component.openLens();
          fixture.detectChanges();

          let paneRect = component.getEditPane()!.getBoundingClientRect();
          expectPixelsToEqual(paneRect.top, cellRects[0].top);
          expectPixelsToEqual(paneRect.left, cellRects[0].left);
          expectPixelsToEqual(paneRect.right, cellRects[1].right);

          component.colspan = {after: 1};
          fixture.changeDetectorRef.markForCheck();
          fixture.detectChanges();

          paneRect = component.getEditPane()!.getBoundingClientRect();
          expectPixelsToEqual(paneRect.top, cellRects[1].top);
          expectPixelsToEqual(paneRect.left, cellRects[1].left);
          expectPixelsToEqual(paneRect.right, cellRects[2].right);

          component.colspan = {before: 1, after: 1};
          fixture.changeDetectorRef.markForCheck();
          fixture.detectChanges();

          paneRect = component.getEditPane()!.getBoundingClientRect();
          expectPixelsToEqual(paneRect.top, cellRects[0].top);
          expectPixelsToEqual(paneRect.left, cellRects[0].left);
          expectPixelsToEqual(paneRect.right, cellRects[2].right);
          clearLeftoverTimers();
        }));

        it('updates the form and submits, closing the lens', fakeAsync(() => {
          component.openLens();
          fixture.detectChanges();

          component.getNameInput()!.value = 'Hydragon';
          component.getNameInput()!.dispatchEvent(new Event('input'));

          component.clickSubmitButton();
          fixture.detectChanges();
          expect(component.getEditCell().firstChild!.textContent!.trim()).toBe('Hydragon');
          expect(component.lensIsOpen()).toBe(false);
          clearLeftoverTimers();
        }));

        it('does not close the lens on submit when form is invalid', fakeAsync(() => {
          component.openLens();
          fixture.detectChanges();

          component.getNameInput()!.value = '';
          component.getNameInput()!.dispatchEvent(new Event('input'));

          component.clickSubmitButton();

          expect(component.lensIsOpen()).toBe(true);
          clearLeftoverTimers();
        }));

        it(
          'closes lens on submit when form is invalid with ' +
            'cdkEditControlIgnoreSubmitUnlessValid = false',
          fakeAsync(() => {
            component.ignoreSubmitUnlessValid = false;
            component.openLens();
            fixture.detectChanges();

            component.getNameInput()!.value = '';
            component.getNameInput()!.dispatchEvent(new Event('input'));

            component.clickSubmitButton();

            expect(component.lensIsOpen()).toBe(false);
            clearLeftoverTimers();
          }),
        );

        it('closes the lens on close', fakeAsync(() => {
          component.openLens();
          fixture.detectChanges();

          component.clickCloseButton();

          expect(component.lensIsOpen()).toBe(false);
          clearLeftoverTimers();
        }));

        it('closes and reopens a lens with modified value persisted', fakeAsync(() => {
          component.openLens();
          fixture.detectChanges();

          component.getNameInput()!.value = 'Hydragon';
          component.getNameInput()!.dispatchEvent(new Event('input'));

          component.clickCloseButton();
          fixture.detectChanges();

          expect(component.getEditCell().firstChild!.textContent!.trim()).toBe('Hydrogen');
          expect(component.lensIsOpen()).toBe(false);

          component.openLens();
          fixture.detectChanges();

          expect(component.getNameInput()!.value).toBe('Hydragon');
          clearLeftoverTimers();
        }));

        it('resets the lens to original value', fakeAsync(() => {
          component.openLens();
          fixture.detectChanges();

          component.getNameInput()!.value = 'Hydragon';
          component.getNameInput()!.dispatchEvent(new Event('input'));

          component.clickRevertButton();

          expect(component.getNameInput()!.value).toBe('Hydrogen');
          clearLeftoverTimers();
        }));

        it('should not reset the values when clicking revert without making changes', fakeAsync(() => {
          component.openLens();
          fixture.detectChanges();

          expect(component.getNameInput()!.value).toBe('Hydrogen');
          expect(component.getWeightInput()!.value).toBe('1.007');

          component.clickRevertButton();

          expect(component.getNameInput()!.value).toBe('Hydrogen');
          expect(component.getWeightInput()!.value).toBe('1.007');
          clearLeftoverTimers();
        }));

        it('resets the lens to previously submitted value', fakeAsync(() => {
          component.openLens();
          fixture.detectChanges();

          component.getNameInput()!.value = 'Hydragon';
          component.getNameInput()!.dispatchEvent(new Event('input'));

          component.clickSubmitButton();
          fixture.detectChanges();

          component.openLens();
          fixture.detectChanges();

          component.getNameInput()!.value = 'Hydragon X';
          component.getNameInput()!.dispatchEvent(new Event('input'));

          component.clickRevertButton();

          expect(component.getNameInput()!.value).toBe('Hydragon');
          clearLeftoverTimers();
        }));

        it('closes the lens on escape', fakeAsync(() => {
          component.openLens();
          fixture.detectChanges();

          const event = new KeyboardEvent('keydown', {bubbles: true, key: 'Escape'});
          spyOn(event, 'preventDefault').and.callThrough();
          component.getNameInput()!.dispatchEvent(event);

          expect(component.lensIsOpen()).toBe(false);
          expect(event.preventDefault).toHaveBeenCalled();
          clearLeftoverTimers();
        }));

        it('does not close the lens on escape with a modifier key', fakeAsync(() => {
          component.openLens();
          fixture.detectChanges();

          const event = new KeyboardEvent('keydown', {bubbles: true, key: 'Escape'});
          Object.defineProperty(event, 'altKey', {get: () => true});

          spyOn(event, 'preventDefault').and.callThrough();
          component.getNameInput()!.dispatchEvent(event);

          expect(component.lensIsOpen()).toBe(true);
          expect(event.preventDefault).not.toHaveBeenCalled();
          clearLeftoverTimers();
        }));

        it('does not close the lens on click within lens', fakeAsync(() => {
          component.openLens();
          fixture.detectChanges();

          component.getNameInput()!.dispatchEvent(new Event('click', {bubbles: true}));

          expect(component.lensIsOpen()).toBe(true);
          clearLeftoverTimers();
        }));

        it('closes the lens on outside click', fakeAsync(() => {
          component.openLens();
          fixture.detectChanges();

          component.getNameInput()!.value = 'Hydragon';
          component.getNameInput()!.dispatchEvent(new Event('input'));
          document.body.dispatchEvent(new Event('click', {bubbles: true}));
          fixture.detectChanges();

          expect(component.lensIsOpen()).toBe(false);
          expect(component.getEditCell().firstChild!.textContent!.trim()).toBe('Hydrogen');
          clearLeftoverTimers();
        }));

        it(
          'submits the lens on outside click with ' + 'cdkEditControlClickOutBehavior = "submit"',
          fakeAsync(() => {
            component.clickOutBehavior = 'submit';
            component.openLens();
            fixture.detectChanges();

            component.getNameInput()!.value = 'Hydragon';
            component.getNameInput()!.dispatchEvent(new Event('input'));
            document.body.dispatchEvent(new Event('click', {bubbles: true}));
            fixture.detectChanges();

            expect(component.lensIsOpen()).toBe(false);
            expect(component.getEditCell().firstChild!.textContent!.trim()).toBe('Hydragon');
            clearLeftoverTimers();
          }),
        );

        it(
          'does nothing on outside click with ' + 'cdkEditControlClickOutBehavior = "noop"',
          fakeAsync(() => {
            component.clickOutBehavior = 'noop';
            component.openLens();
            fixture.detectChanges();

            component.getNameInput()!.value = 'Hydragon';
            component.getNameInput()!.dispatchEvent(new Event('input'));
            document.body.dispatchEvent(new Event('click', {bubbles: true}));
            fixture.detectChanges();

            expect(component.lensIsOpen()).toBe(true);
            expect(component.getEditCell().firstChild!.textContent!.trim()).toBe('Hydrogen');
            clearLeftoverTimers();
          }),
        );

        it('sets focus on the first input in the lens', fakeAsync(() => {
          component.openLens();
          fixture.detectChanges();

          expect(document.activeElement).toBe(component.getNameInput());
          clearLeftoverTimers();
        }));

        it('returns focus to the edited cell after closing', fakeAsync(() => {
          component.openLens();
          fixture.detectChanges();

          component.clickCloseButton();

          expect(document.activeElement).toBe(component.getEditCell());
          clearLeftoverTimers();
        }));

        it(
          'does not focus to the edited cell after closing if another element ' +
            'outside the lens is already focused',
          fakeAsync(() => {
            component.openLens(0);

            component.getEditCell(1).focus();
            component.getEditCell(1).dispatchEvent(new Event('click', {bubbles: true}));

            expect(document.activeElement).toBe(component.getEditCell(1));
            clearLeftoverTimers();
          }),
        );

        it('should pass the directionality to the overlay', fakeAsync(() => {
          component.direction = 'rtl';
          fixture.changeDetectorRef.markForCheck();
          fixture.detectChanges();

          component.openLens();
          fixture.detectChanges();

          expect(component.getEditBoundingBox()!.getAttribute('dir')).toBe('rtl');
          clearLeftoverTimers();
        }));
      });
    });
  }
});

interface ChemicalElement {
  name: string;
  weight: number;
}

function createElementData(): ChemicalElement[] {
  return [
    {name: 'Hydrogen', weight: 1.007},
    {name: 'Helium', weight: 4.0026},
    {name: 'Lithium', weight: 6.941},
    {name: 'Beryllium', weight: 9.0122},
    {name: 'Boron', weight: 10.81},
  ];
}

function getElements(element: Element, query: string): HTMLElement[] {
  return [].slice.call(element.querySelectorAll(query));
}

function getRows(tableElement: Element): HTMLElement[] {
  return getElements(tableElement, '.cdk-row, tr');
}

function getCells(row: Element): HTMLElement[] {
  if (!row) {
    return [];
  }

  return getElements(row, '.cdk-cell, td');
}

// Common actions like mouse events and focus/blur cause timers to be fired off.
// When not testing this behavior directly, use this function to clear any timers that were
// created in passing.
function clearLeftoverTimers() {
  tick(100);
}
