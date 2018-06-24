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

    testComponent.clickItem('item-1');
    fixture.detectChanges();
    expect(testComponent.selection.selectedItems.length).toBe(1);

    testComponent.clickItem('item-2');
    fixture.detectChanges();
    expect(testComponent.selection.selectedItems.length).toBe(1);
  });

  it('should select multiple', () => {
    testComponent.mode = 'multiple';
    fixture.detectChanges();

    testComponent.clickItem('item-1');
    fixture.detectChanges();
    expect(testComponent.selection.selectedItems.length).toBe(1);

    testComponent.clickItem('item-2');
    fixture.detectChanges();
    expect(testComponent.selection.selectedItems.length).toBe(2);
  });

  it('should select one with modifier multipler', () => {
    testComponent.mode = 'multiple';
    testComponent.modifier = true;
    fixture.detectChanges();

    testComponent.clickItem('item-1');
    fixture.detectChanges();
    expect(testComponent.selection.selectedItems.length).toBe(1);

    testComponent.clickItem('item-2');
    fixture.detectChanges();
    expect(testComponent.selection.selectedItems.length).toBe(1);
  });

  it('should select multiple with modifier multipler', () => {
    testComponent.mode = 'multiple';
    testComponent.modifier = true;
    fixture.detectChanges();

    testComponent.clickItem('item-1');
    fixture.detectChanges();
    expect(testComponent.selection.selectedItems.length).toBe(1);

    testComponent.clickItem('item-2', 'meta');
    fixture.detectChanges();
    expect(testComponent.selection.selectedItems.length).toBe(2);
  });

  it('should select multiple range with modifier multipler', () => {
    testComponent.mode = 'multiple';
    testComponent.modifier = true;
    fixture.detectChanges();

    testComponent.clickItem('item-0');
    fixture.detectChanges();
    expect(testComponent.selection.selectedItems.length).toBe(1);

    testComponent.clickItem('item-2', 'shift');
    fixture.detectChanges();
    expect(testComponent.selection.selectedItems.length).toBe(3);
  });

  it('should not clear single after selection', () => {
    testComponent.deselectable = false;
    fixture.detectChanges();

    testComponent.clickItem('item-1');
    fixture.detectChanges();
    expect(testComponent.selection.selectedItems.length).toBe(1);

    testComponent.clickItem('item-1');
    fixture.detectChanges();
    expect(testComponent.selection.selectedItems.length).toBe(1);
  });

  it('should not clear multiple after selection', () => {
    testComponent.deselectable = false;
    testComponent.mode = 'multiple';
    fixture.detectChanges();

    testComponent.clickItem('item-1');
    fixture.detectChanges();
    expect(testComponent.selection.selectedItems.length).toBe(1);

    testComponent.clickItem('item-1');
    fixture.detectChanges();
    expect(testComponent.selection.selectedItems.length).toBe(1);
  });

  it('should not clear modifier multiple after selection', () => {
    testComponent.deselectable = false;
    testComponent.mode = 'multiple';
    testComponent.modifier = true;
    fixture.detectChanges();

    testComponent.clickItem('item-1');
    fixture.detectChanges();
    expect(testComponent.selection.selectedItems.length).toBe(1);

    testComponent.clickItem('item-1');
    fixture.detectChanges();
    expect(testComponent.selection.selectedItems.length).toBe(1);
  });

  it('should not select more than max allow', () => {
    testComponent.max = 2;
    testComponent.mode = 'multiple';
    fixture.detectChanges();

    testComponent.clickItem('item-0');
    fixture.detectChanges();
    expect(testComponent.selection.selectedItems.length).toBe(1);

    testComponent.clickItem('item-1');
    fixture.detectChanges();
    expect(testComponent.selection.selectedItems.length).toBe(2);

    testComponent.clickItem('item-2');
    fixture.detectChanges();
    expect(testComponent.selection.selectedItems.length).toBe(2);
  });

  it('should have yellow selected', () => {
    testComponent.selections = ['yellow'];
    fixture.detectChanges();
    expect(testComponent.selection.selectedItems.length).toBe(1);
  });

  it('should not select a disabled selection', () => {
    fixture.detectChanges();

    testComponent.clickItem('item-3');
    fixture.detectChanges();
    expect(testComponent.selection.selectedItems.length).toBe(0);
  });

  it('should select all selections', () => {
    testComponent.mode = 'multiple';
    fixture.detectChanges();

    testComponent.selection.selectAll();
    fixture.detectChanges();
    expect(testComponent.selection.selectedItems.length).toBe(5);
  });

  it('should not select all selections in single mode', () => {
    fixture.detectChanges();

    testComponent.selection.selectAll();
    fixture.detectChanges();
    expect(testComponent.selection.selectedItems.length).toBe(0);
  });

  it('should not select all selections with 2 max selections', () => {
    testComponent.mode = 'multiple';
    testComponent.max = 2;
    fixture.detectChanges();

    testComponent.selection.selectAll();
    fixture.detectChanges();
    expect(testComponent.selection.selectedItems.length).toBe(0);
  });

  it('should deselect all selections', () => {
    fixture.detectChanges();

    testComponent.clickItem('item-0');
    testComponent.clickItem('item-1');
    fixture.detectChanges();

    testComponent.selection.deselectAll();
    fixture.detectChanges();

    expect(testComponent.selection.selectedItems.length).toBe(0);
  });

});

@Component({
  template: `
    <ul
      [cdkSelection]="selections"
      [cdkSelectionMode]="mode"
      [cdkSelectRequireModifier]="modifier"
      [cdkSelectionMaxSelected]="max"
      [cdkSelectionDeselectable]="deselectable">
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
    {label: 'Yellow', value: 'yellow'},
    {label: 'Blue', value: 'blue'},
    {label: 'Green', value: 'green'},
    {label: 'Pink', value: 'pink'},
    {label: 'Red', value: 'red'},
  ];

  selections: string[] = [];
  deselectable = true;
  modifier = false;
  mode = 'single';
  max: number;

  constructor(public elementRef: ElementRef) {}

  clickItem(id: string, modifier?: 'meta' | 'shift') {
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
