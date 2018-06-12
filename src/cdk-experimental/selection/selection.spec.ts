import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CdkSelection} from './selection';
import {CdkSelectionModule} from './selection-module';
import {Component, ElementRef, ViewChild} from '@angular/core';
import {dispatchMouseEvent, dispatchEvent} from '@angular/cdk/testing';

describe('CdkSelection', () => {

  let fixture: ComponentFixture<Selection>;
  let testComponent: Selection;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CdkSelectionModule],
      declarations: [Selection],
    }).compileComponents();

    fixture = TestBed.createComponent(Selection);
    testComponent = fixture.componentInstance;
  });

  it('should select one', () => {
    fixture.detectChanges();

    testComponent.clickITem('item-1');
    fixture.detectChanges();
    expect(testComponent.selection.selections.length).toBe(1);

    testComponent.clickITem('item-2');
    fixture.detectChanges();
    expect(testComponent.selection.selections.length).toBe(1);
  });

  it('should select multiple', () => {
    testComponent.strategy = 'multiple';
    fixture.detectChanges();

    testComponent.clickITem('item-1');
    fixture.detectChanges();
    expect(testComponent.selection.selections.length).toBe(1);

    testComponent.clickITem('item-2');
    fixture.detectChanges();
    expect(testComponent.selection.selections.length).toBe(2);
  });

  it('should select one with modifier multipler', () => {
    testComponent.strategy = 'modifierMultiple';
    fixture.detectChanges();

    testComponent.clickITem('item-1');
    fixture.detectChanges();
    expect(testComponent.selection.selections.length).toBe(1);

    testComponent.clickITem('item-2');
    fixture.detectChanges();
    expect(testComponent.selection.selections.length).toBe(1);
  });

  it('should select multiple with modifier multipler', () => {
    testComponent.strategy = 'modifierMultiple';
    fixture.detectChanges();

    testComponent.clickITem('item-1');
    fixture.detectChanges();
    expect(testComponent.selection.selections.length).toBe(1);

    testComponent.clickITem('item-2', 'meta');
    fixture.detectChanges();
    expect(testComponent.selection.selections.length).toBe(2);
  });

  it('should select multiple range with modifier multipler', () => {
    testComponent.strategy = 'modifierMultiple';
    fixture.detectChanges();

    testComponent.clickITem('item-0');
    fixture.detectChanges();
    expect(testComponent.selection.selections.length).toBe(1);

    testComponent.clickITem('item-2', 'shift');
    fixture.detectChanges();
    expect(testComponent.selection.selections.length).toBe(3);
  });

  it('should not clear single after selection', () => {
    testComponent.clearable = false;
    fixture.detectChanges();

    testComponent.clickITem('item-1');
    fixture.detectChanges();
    expect(testComponent.selection.selections.length).toBe(1);

    testComponent.clickITem('item-1');
    fixture.detectChanges();
    expect(testComponent.selection.selections.length).toBe(1);
  });

  it('should not clear multiple after selection', () => {
    testComponent.clearable = false;
    testComponent.strategy = 'multiple';
    fixture.detectChanges();

    testComponent.clickITem('item-1');
    fixture.detectChanges();
    expect(testComponent.selection.selections.length).toBe(1);

    testComponent.clickITem('item-1');
    fixture.detectChanges();
    expect(testComponent.selection.selections.length).toBe(1);
  });

  it('should not clear modifier multiple after selection', () => {
    testComponent.clearable = false;
    testComponent.strategy = 'modifierMultiple';
    fixture.detectChanges();

    testComponent.clickITem('item-1');
    fixture.detectChanges();
    expect(testComponent.selection.selections.length).toBe(1);

    testComponent.clickITem('item-1');
    fixture.detectChanges();
    expect(testComponent.selection.selections.length).toBe(1);
  });

  it('should not select more than max allow', () => {
    testComponent.max = 2;
    testComponent.strategy = 'multiple';
    fixture.detectChanges();

    testComponent.clickITem('item-0');
    fixture.detectChanges();
    expect(testComponent.selection.selections.length).toBe(1);

    testComponent.clickITem('item-1');
    fixture.detectChanges();
    expect(testComponent.selection.selections.length).toBe(2);

    testComponent.clickITem('item-2');
    fixture.detectChanges();
    expect(testComponent.selection.selections.length).toBe(2);
  });

  it('should have yellow selected', () => {
    testComponent.selections = ['yellow'];
    fixture.detectChanges();
    expect(testComponent.selection.selections.length).toBe(1);
  });

  it('should not select a disabled selection', () => {
    fixture.detectChanges();

    testComponent.clickITem('item-3');
    fixture.detectChanges();
    expect(testComponent.selection.selections.length).toBe(0);
  });

});

@Component({
  template: `
    <ul
      [cdkSelection]="selections"
      [cdkSelectionStrategy]="strategy"
      [cdkSelectionMaxSelections]="max"
      [cdkSelectionClearable]="clearable">
      <li *ngFor="let item of items; let i = index;">
        <button [cdkSelectionToggle]="item.value" [id]="'item-' + i" [disabled]="i === 3">
          {{item.label}}
        </button>
      </li>
    </ul>
  `
})
class Selection {
  @ViewChild(CdkSelection) selection: CdkSelection<any>;

  items = [
    { label: 'Yellow', value: 'yellow' },
    { label: 'Blue', value: 'blue' },
    { label: 'Green', value: 'green' },
    { label: 'Pink', value: 'pink' },
    { label: 'Red', value: 'red' },
  ];

  selections: string[] = [];
  clearable = true;
  strategy = 'single';
  max: number;

  constructor(public elementRef: ElementRef) {}

  clickITem(id: string, modifier?: 'meta' | 'shift') {
    const toggleElement = this.elementRef.nativeElement.querySelector(`#${id}`);

    if (modifier) {
      const event: any = document.createEvent('Event');
      event.initEvent('mousedown', true, true);
      if (modifier === 'meta') {
        event.metaKey = true;
        event.ctrlKey = true;
      } else if (modifier === 'shift') {
        event.shiftKey = true;
      }
      dispatchEvent(toggleElement, event);
    }

    dispatchMouseEvent(toggleElement, 'click');
  }

}
