import {Component, DebugElement, ViewChild, ElementRef} from '@angular/core';
import {async, TestBed, ComponentFixture} from '@angular/core/testing';
import {MatChipsModule, MatChipEditInputDestroyEvent, MatChipEditInput, MatChipEditInputManager, MatChipEditInputInterface, MAT_CHIP_EDIT_INPUT_MANAGER} from './index';
import {By} from '@angular/platform-browser';


describe('MDC-based MatChipEditInput', () => {
  const DEFAULT_INITIAL_VALUE = 'INITIAL_VALUE';

  let testComponent: ChipEditInputContainer;
  let fixture: ComponentFixture<any>;
  let inputDebugElement: DebugElement;
  let inputInstance: MatChipEditInput;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatChipsModule],
      declarations: [
        ChipEditInputContainer,
      ],
    });

    TestBed.compileComponents();
  }));

  function initialize(initialValue = DEFAULT_INITIAL_VALUE) {
    fixture = TestBed.createComponent(ChipEditInputContainer);
    testComponent = fixture.debugElement.componentInstance;

    spyOn(testComponent, 'onUpdate');
    spyOn(testComponent, 'onDestroy');
    spyOn(testComponent, 'setMatChipEditInput');
    spyOn(testComponent, 'clearMatChipEditInput');

    testComponent.initialValue = initialValue;
    testComponent.active = true;
    fixture.detectChanges();

    inputDebugElement = fixture.debugElement.query(By.directive(MatChipEditInput))!;
    inputInstance = inputDebugElement.injector.get<MatChipEditInput>(MatChipEditInput);
  }

  describe('on initialization', () => {
    it('should set the initial input text', () => {
      initialize();
      expect(inputInstance.getNativeElement().textContent).toEqual(DEFAULT_INITIAL_VALUE);
    });

    it('should focus the input', () => {
      initialize();
      expect(document.activeElement).toEqual(inputInstance.getNativeElement());
    });

    it('should register itself with the injected manager', () => {
      initialize();
      expect(testComponent.setMatChipEditInput).toHaveBeenCalledWith(inputInstance);
    });
  });

  describe('on destruction', () => {
    it('should emit hadFocus: true if the input had focus', () => {
      initialize();
      testComponent.active = false;
      fixture.detectChanges();
      expect(testComponent.onDestroy).toHaveBeenCalledWith({hadFocus: true});
    });

    it('should emit hadFocus: false if the input did not have focus', () => {
      initialize();
      testComponent.otherFocus.nativeElement.focus();
      testComponent.active = false;
      fixture.detectChanges();
      expect(testComponent.onDestroy).toHaveBeenCalledWith({hadFocus: false});
    });

    it('should clear the manager\'s input', () => {
      initialize();
      testComponent.active = false;
      fixture.detectChanges();
      expect(testComponent.clearMatChipEditInput).toHaveBeenCalled();
    });
  });

  it('should emit a new value the input changes', () => {
    initialize();
    const newValue = 'NEW_VALUE';
    inputInstance.setValue(newValue);
    expect(testComponent.onUpdate).toHaveBeenCalledWith(newValue);
  });
});

@Component({
  template: `<mat-chip-edit-input *ngIf="active"
                                  [initialValue]="initialValue"
                                  (updated)="onUpdate($event)"
                                  (destroyed)="onDestroy($event)"></mat-chip-edit-input>
             <button #otherFocus></button>`,
  providers: [{provide: MAT_CHIP_EDIT_INPUT_MANAGER, useExisting: ChipEditInputContainer}],
})
class ChipEditInputContainer implements MatChipEditInputManager {
  active = false;
  initialValue = '';

  @ViewChild('otherFocus') otherFocus!: ElementRef;

  onUpdate: (value: string) => void = () => {};
  onDestroy: (event: MatChipEditInputDestroyEvent) => void = () => {};

  setMatChipEditInput: (value: MatChipEditInputInterface) => void = () => {};
  clearMatChipEditInput: () => void = () => {};
}
