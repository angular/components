import {async, TestBed, ComponentFixture} from '@angular/core/testing';
import {MdChipsModule} from './index';
import {Component, DebugElement} from '@angular/core';
import {MdChipInput, MdChipInputEvent} from './chip-input';
import {By} from '@angular/platform-browser';
import {Dir} from '../core/rtl/dir';
import {FakeKeyboardEvent} from './chip-list.spec';
import {ENTER, COMMA} from '../core/keyboard/keycodes';

describe('MdChipInput', () => {
  let fixture: ComponentFixture<any>;
  let testChipInput: TestChipInput;
  let inputDebugElement: DebugElement;
  let inputNativeElement: HTMLElement;
  let chipInputDirective: MdChipInput;

  let dir = 'ltr';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdChipsModule],
      declarations: [TestChipInput],
      providers: [{
        provide: Dir, useFactory: () => {
          return {value: dir.toLowerCase()};
        }
      }]
    });

    TestBed.compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TestChipInput);
    testChipInput = fixture.debugElement.componentInstance;
    fixture.detectChanges();

    inputDebugElement = fixture.debugElement.query(By.directive(MdChipInput));
    chipInputDirective = inputDebugElement.injector.get(MdChipInput) as MdChipInput;
    inputNativeElement = inputDebugElement.nativeElement;
  }));

  describe('basic behavior', () => {
    it('emits the (chipAdded) on enter keyup', () => {
      let ENTER_EVENT = new FakeKeyboardEvent(ENTER, inputNativeElement) as any;

      spyOn(testChipInput, 'add');

      chipInputDirective._keydown(ENTER_EVENT);
      expect(testChipInput.add).toHaveBeenCalled();
    });
  });

  describe('[addOnBlur]', () => {
    it('allows (chipAdded) when true', () => {
      spyOn(testChipInput, 'add');

      testChipInput.addOnBlur = true;
      fixture.detectChanges();

      chipInputDirective._blur();
      expect(testChipInput.add).toHaveBeenCalled();
    });

    it('disallows (chipAdded) when false', () => {
      spyOn(testChipInput, 'add');

      testChipInput.addOnBlur = false;
      fixture.detectChanges();

      chipInputDirective._blur();
      expect(testChipInput.add).not.toHaveBeenCalled();
    });
  });

  describe('[separatorKeys]', () => {
    it('does not emit (chipAdded) when a non-separator key is pressed', () => {
      let ENTER_EVENT = new FakeKeyboardEvent(ENTER, inputNativeElement) as any;
      spyOn(testChipInput, 'add');

      testChipInput.separatorKeys = [COMMA];
      fixture.detectChanges();

      chipInputDirective._keydown(ENTER_EVENT);
      expect(testChipInput.add).not.toHaveBeenCalled();
    });

    it('emits (chipAdded) when a custom separator keys is pressed', () => {
      let COMMA_EVENT = new FakeKeyboardEvent(COMMA, inputNativeElement) as any;
      spyOn(testChipInput, 'add');

      testChipInput.separatorKeys = [COMMA];
      fixture.detectChanges();

      chipInputDirective._keydown(COMMA_EVENT);
      expect(testChipInput.add).toHaveBeenCalled();
    });
  });
});

@Component({
  template: `
    <md-chip-list>
      <input mdChipInput [addOnBlur]="addOnBlur" [separatorKeys]="separatorKeys"
             (chipAdded)="add($event)" />
    </md-chip-list>
  `
})
class TestChipInput {
  addOnBlur: boolean = false;
  separatorKeys: number[] = [ENTER];

  add(event: MdChipInputEvent) {
  }
}
