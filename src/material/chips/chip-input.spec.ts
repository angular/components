import {Directionality} from '@angular/cdk/bidi';
import {COMMA, ENTER, TAB} from '@angular/cdk/keycodes';
import {
  createKeyboardEvent,
  dispatchKeyboardEvent,
  dispatchEvent,
} from '@angular/cdk/testing/private';
import {Component, Provider, Type, ViewChild} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {TestBed, fakeAsync, flush} from '@angular/core/testing';
import {MatFormFieldModule} from '../form-field';
import {By} from '@angular/platform-browser';
import {Subject} from 'rxjs';
import {
  MAT_CHIPS_DEFAULT_OPTIONS,
  MatChipGrid,
  MatChipInput,
  MatChipInputEvent,
  MatChipsDefaultOptions,
  MatChipsModule,
} from './index';
import {MATERIAL_ANIMATIONS} from '../core';

describe('MatChipInput', () => {
  let dir = 'ltr';

  function createComponent<T>(type: Type<T>, providers: Provider[] = []) {
    TestBed.configureTestingModule({
      imports: [MatChipsModule, MatFormFieldModule, ReactiveFormsModule],
      providers: [
        {
          provide: Directionality,
          useFactory: () => ({
            value: dir.toLowerCase(),
            change: new Subject(),
          }),
        },
        {provide: MATERIAL_ANIMATIONS, useValue: {animationsDisabled: true}},
        ...providers,
      ],
      declarations: [type],
    });

    const fixture = TestBed.createComponent(type);
    fixture.detectChanges();
    return {fixture, input: fixture.nativeElement.querySelector('input') as HTMLInputElement};
  }

  it('emits the (chipEnd) on enter keyup', () => {
    const {fixture, input} = createComponent(TestChipInput);
    spyOn(fixture.componentInstance, 'add');

    dispatchKeyboardEvent(input, 'keydown', ENTER);
    expect(fixture.componentInstance.add).toHaveBeenCalled();
  });

  it('should have a default id', () => {
    const {input} = createComponent(TestChipInput);
    expect(input.getAttribute('id')).toBeTruthy();
  });

  it('should allow binding to the `placeholder` input', () => {
    const {fixture, input} = createComponent(TestChipInput);
    expect(input.hasAttribute('placeholder')).toBe(false);

    fixture.componentInstance.placeholder = 'bound placeholder';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(input.getAttribute('placeholder')).toBe('bound placeholder');
  });

  it('should become disabled if the list is disabled', () => {
    const {fixture, input} = createComponent(TestChipInput);
    expect(input.hasAttribute('disabled')).toBe(false);
    expect(fixture.componentInstance.chipInput.disabled).toBe(false);

    fixture.componentInstance.chipGridInstance.disabled = true;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(input.disabled).toBe(true);
    expect(fixture.componentInstance.chipInput.disabled).toBe(true);
  });

  it('should be able to set an input as being disabled and interactive', fakeAsync(() => {
    const {fixture, input} = createComponent(TestChipInput);
    fixture.componentInstance.chipGridInstance.disabled = true;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(input.disabled).toBe(true);
    expect(input.readOnly).toBe(false);
    expect(input.hasAttribute('aria-disabled')).toBe(false);

    fixture.componentInstance.disabledInteractive = true;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(input.disabled).toBe(false);
    expect(input.readOnly).toBe(true);
    expect(input.getAttribute('aria-disabled')).toBe('true');
  }));

  it('should be able to set an input as being disabled and interactive when using the reactive forms module', fakeAsync(() => {
    const {fixture, input} = createComponent(ChipInputWithFormControl);
    fixture.componentInstance.control.disable();
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(input.disabled).toBe(true);
    expect(input.readOnly).toBe(false);
    expect(input.hasAttribute('aria-disabled')).toBe(false);

    fixture.componentInstance.disabledInteractive = true;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(input.disabled).toBe(false);
    expect(input.readOnly).toBe(true);
    expect(input.getAttribute('aria-disabled')).toBe('true');
  }));

  it('should be aria-required if the list is required', () => {
    const {fixture, input} = createComponent(TestChipInput);
    expect(input.hasAttribute('aria-required')).toBe(false);

    fixture.componentInstance.required = true;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(input.getAttribute('aria-required')).toBe('true');
  });

  it('should be required if the list is required', () => {
    const {fixture, input} = createComponent(TestChipInput);
    expect(input.hasAttribute('required')).toBe(false);

    fixture.componentInstance.required = true;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(input.getAttribute('required')).toBe('true');
  });

  it('should allow focus to escape when tabbing forwards', fakeAsync(() => {
    const {fixture} = createComponent(TestChipInput);
    const gridElement: HTMLElement = fixture.nativeElement.querySelector('mat-chip-grid');

    expect(gridElement.getAttribute('tabindex')).toBe('0');

    dispatchKeyboardEvent(gridElement, 'keydown', TAB);
    fixture.detectChanges();

    expect(gridElement.getAttribute('tabindex'))
      .withContext('Expected tabIndex to be set to -1 temporarily.')
      .toBe('-1');

    flush();
    fixture.detectChanges();

    expect(gridElement.getAttribute('tabindex'))
      .withContext('Expected tabIndex to be reset back to 0')
      .toBe('0');
  }));

  it('should set input styling classes', () => {
    const {input} = createComponent(TestChipInput);
    expect(input.classList).toContain('mat-mdc-input-element');
    expect(input.classList).toContain('mat-mdc-form-field-input-control');
    expect(input.classList).toContain('mat-mdc-chip-input');
    expect(input.classList).toContain('mdc-text-field__input');
  });

  it('should set `aria-describedby` to the id of the mat-hint', () => {
    const {fixture, input} = createComponent(TestChipInput);
    expect(input.getAttribute('aria-describedby')).toBeNull();

    fixture.componentInstance.hint = 'test';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    const hint = fixture.debugElement.query(By.css('mat-hint')).nativeElement;

    expect(input.getAttribute('aria-describedby')).toBe(hint.getAttribute('id'));
    expect(input.getAttribute('aria-describedby')).toMatch(/^mat-mdc-hint-\w+\d+$/);
  });

  it('should support user binding to `aria-describedby`', () => {
    const {fixture, input} = createComponent(TestChipInput);
    input.setAttribute('aria-describedby', 'test');
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(input.getAttribute('aria-describedby')).toBe('test');
  });

  it('should preserve aria-describedby set directly in the DOM', fakeAsync(() => {
    const {fixture, input} = createComponent(TestChipInput);
    input.setAttribute('aria-describedby', 'custom');
    fixture.componentInstance.hint = 'test';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    const hint = fixture.debugElement.query(By.css('mat-hint')).nativeElement;

    expect(input.getAttribute('aria-describedby')).toBe(`${hint.getAttribute('id')} custom`);
  }));

  describe('[addOnBlur]', () => {
    it('allows (chipEnd) when true', () => {
      const {fixture} = createComponent(TestChipInput);
      spyOn(fixture.componentInstance, 'add');

      fixture.componentInstance.addOnBlur = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      fixture.componentInstance.chipInput._blur();
      expect(fixture.componentInstance.add).toHaveBeenCalled();
    });

    it('disallows (chipEnd) when false', () => {
      const {fixture} = createComponent(TestChipInput);
      spyOn(fixture.componentInstance, 'add');

      fixture.componentInstance.addOnBlur = false;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      fixture.componentInstance.chipInput._blur();
      expect(fixture.componentInstance.add).not.toHaveBeenCalled();
    });
  });

  describe('[separatorKeyCodes]', () => {
    it('does not emit (chipEnd) when a non-separator key is pressed', () => {
      const {fixture, input} = createComponent(TestChipInput);
      spyOn(fixture.componentInstance, 'add');

      fixture.componentInstance.chipInput.separatorKeyCodes = [COMMA];
      fixture.detectChanges();

      dispatchKeyboardEvent(input, 'keydown', ENTER);
      expect(fixture.componentInstance.add).not.toHaveBeenCalled();
    });

    it('emits (chipEnd) when a custom separator keys is pressed', () => {
      const {fixture, input} = createComponent(TestChipInput);
      spyOn(fixture.componentInstance, 'add');

      fixture.componentInstance.chipInput.separatorKeyCodes = [COMMA];
      fixture.detectChanges();

      dispatchKeyboardEvent(input, 'keydown', COMMA);
      expect(fixture.componentInstance.add).toHaveBeenCalled();
    });

    it('emits accepts the custom separator keys in a Set', () => {
      const {fixture, input} = createComponent(TestChipInput);
      spyOn(fixture.componentInstance, 'add');

      fixture.componentInstance.chipInput.separatorKeyCodes = new Set([COMMA]);
      fixture.detectChanges();

      dispatchKeyboardEvent(input, 'keydown', COMMA);
      expect(fixture.componentInstance.add).toHaveBeenCalled();
    });

    it('emits (chipEnd) when the separator keys are configured globally', () => {
      const {fixture, input} = createComponent(TestChipInput, [
        {
          provide: MAT_CHIPS_DEFAULT_OPTIONS,
          useValue: {separatorKeyCodes: [COMMA]} as MatChipsDefaultOptions,
        },
      ]);
      fixture.detectChanges();

      spyOn(fixture.componentInstance, 'add');
      fixture.detectChanges();

      dispatchKeyboardEvent(input, 'keydown', COMMA);
      expect(fixture.componentInstance.add).toHaveBeenCalled();
    });

    it('should not emit the chipEnd event if a separator is pressed with a modifier key', () => {
      const {fixture, input} = createComponent(TestChipInput);
      spyOn(fixture.componentInstance, 'add');

      fixture.componentInstance.chipInput.separatorKeyCodes = [ENTER];
      fixture.detectChanges();

      dispatchKeyboardEvent(input, 'keydown', ENTER, undefined, {shift: true});
      expect(fixture.componentInstance.add).not.toHaveBeenCalled();
    });

    it('should set aria-describedby correctly when a non-empty list of ids is passed to setDescribedByIds', fakeAsync(() => {
      const {fixture, input} = createComponent(TestChipInput);
      const ids = ['a', 'b', 'c'];

      fixture.componentInstance.chipGridInstance.setDescribedByIds(ids);
      flush();
      fixture.detectChanges();

      expect(input.getAttribute('aria-describedby')).toEqual('a b c');
    }));

    it('should set aria-describedby correctly when an empty list of ids is passed to setDescribedByIds', fakeAsync(() => {
      const {fixture, input} = createComponent(TestChipInput);
      const ids: string[] = [];

      fixture.componentInstance.chipGridInstance.setDescribedByIds(ids);
      flush();
      fixture.detectChanges();

      expect(input.getAttribute('aria-describedby')).toBeNull();
    }));

    it('should not emit chipEnd if the key is repeated', () => {
      const {fixture, input} = createComponent(TestChipInput);
      spyOn(fixture.componentInstance, 'add');

      fixture.componentInstance.chipInput.separatorKeyCodes = [COMMA];
      fixture.detectChanges();

      const event = createKeyboardEvent('keydown', COMMA);
      Object.defineProperty(event, 'repeat', {get: () => true});
      dispatchEvent(input, event);
      fixture.detectChanges();

      expect(fixture.componentInstance.add).not.toHaveBeenCalled();
    });
  });
});

@Component({
  template: `
    <mat-form-field [hintLabel]="hint">
      <mat-chip-grid #chipGrid [required]="required">
        <mat-chip-row>Hello</mat-chip-row>
        <input
          [matChipInputFor]="chipGrid"
          [matChipInputAddOnBlur]="addOnBlur"
          [matChipInputDisabledInteractive]="disabledInteractive"
          (matChipInputTokenEnd)="add($event)"
          [placeholder]="placeholder" />
      </mat-chip-grid>
    </mat-form-field>
  `,
  standalone: false,
})
class TestChipInput {
  @ViewChild(MatChipGrid) chipGridInstance: MatChipGrid;
  @ViewChild(MatChipInput) chipInput: MatChipInput;
  addOnBlur: boolean = false;
  placeholder = '';
  required = false;
  disabledInteractive = false;
  hint: string;

  add(_: MatChipInputEvent) {}
}

@Component({
  template: `
    <mat-form-field>
      <mat-chip-grid #chipGrid>
        <mat-chip-row>Hello</mat-chip-row>
        <input
          [formControl]="control"
          [matChipInputFor]="chipGrid"
          [matChipInputDisabledInteractive]="disabledInteractive"/>
      </mat-chip-grid>
    </mat-form-field>
  `,
  standalone: false,
})
class ChipInputWithFormControl {
  @ViewChild(MatChipInput) chipInput: MatChipInput;
  disabledInteractive = false;
  control = new FormControl();
}
