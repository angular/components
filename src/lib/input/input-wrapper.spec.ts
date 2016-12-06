import {async, TestBed, ComponentFixture} from '@angular/core/testing';
import {Component} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {MdInputModule} from './input';
import {MdInputWrapper} from './input-wrapper';
import {MdPlatform} from '../core/platform/platform';


describe('MdInputWrapper', function () {
  let platform: MdPlatform = new MdPlatform();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdInputModule.forRoot(), FormsModule, ReactiveFormsModule],
      declarations: [
        MdInputWrapperPlaceholderRequiredTestComponent,
        MdInputWrapperPlaceholderElementTestComponent,
        MdInputWrapperPlaceholderAttrTestComponent,
        MdInputWrapperHintLabel2TestController,
        MdInputWrapperHintLabelTestController,
        MdInputWrapperInvalidTypeTestController,
        MdInputWrapperInvalidPlaceholderTestController,
        MdInputWrapperInvalidHint2TestController,
        MdInputWrapperInvalidHintTestController,
        MdInputWrapperBaseTestController,
        MdInputWrapperWithId,
        MdInputWrapperDateTestController,
        MdInputWrapperTextTestController,
        MdInputWrapperPasswordTestController,
        MdInputWrapperNumberTestController,
        MdTextareaWithBindings,
        MdInputWrapperWithDisabled,
      ],
    });

    TestBed.compileComponents();
  }));

  it('should default to floating placeholders', () => {
    let fixture = TestBed.createComponent(MdInputWrapperBaseTestController);
    fixture.detectChanges();

    let mdInputWrapper = fixture.debugElement.query(By.directive(MdInputWrapper))
        .componentInstance as MdInputWrapper;
    expect(mdInputWrapper.floatingPlaceholder)
        .toBe(true, 'Expected MdInputWrapper to default to having floating placeholders turned on');
  });

  it('should not be treated as empty if type is date', () => {
    if (!(platform.TRIDENT || platform.FIREFOX)) {
      let fixture = TestBed.createComponent(MdInputWrapperDateTestController);
      fixture.detectChanges();

      let el = fixture.debugElement.query(By.css('label')).nativeElement;
      expect(el).not.toBeNull();
      expect(el.classList.contains('md-empty')).toBe(false);
    }
  });

  // Firefox and IE don't support type="date" and fallback to type="text".
  it('should be treated as empty if type is date on Firefox and IE', () => {
    if (platform.TRIDENT || platform.FIREFOX) {
      let fixture = TestBed.createComponent(MdInputWrapperDateTestController);
      fixture.detectChanges();

      let el = fixture.debugElement.query(By.css('label')).nativeElement;
      expect(el).not.toBeNull();
      expect(el.classList.contains('md-empty')).toBe(true);
    }
  });

  it('should treat text input type as empty at init', () => {
    let fixture = TestBed.createComponent(MdInputWrapperTextTestController);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el).not.toBeNull();
    expect(el.classList.contains('md-empty')).toBe(true);
  });

  it('should treat password input type as empty at init', () => {
    let fixture = TestBed.createComponent(MdInputWrapperPasswordTestController);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el).not.toBeNull();
    expect(el.classList.contains('md-empty')).toBe(true);
  });

  it('should treat number input type as empty at init', () => {
    let fixture = TestBed.createComponent(MdInputWrapperNumberTestController);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el).not.toBeNull();
    expect(el.classList.contains('md-empty')).toBe(true);
  });

  it('should not be empty after input entered', async(() => {
    let fixture = TestBed.createComponent(MdInputWrapperTextTestController);
    fixture.detectChanges();

    let inputEl = fixture.debugElement.query(By.css('input'));
    let el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el).not.toBeNull();
    expect(el.classList.contains('md-empty')).toBe(true, 'should be empty');

    inputEl.nativeElement.value = 'hello';
    // Simulate input event.
    inputEl.triggerEventHandler('input', {target: inputEl.nativeElement});
    fixture.detectChanges();

    el = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(el.classList.contains('md-empty')).toBe(false, 'should not be empty');
  }));

  it('should add id', () => {
    let fixture = TestBed.createComponent(MdInputWrapperTextTestController);
    fixture.detectChanges();

    const inputElement: HTMLInputElement =
        fixture.debugElement.query(By.css('input')).nativeElement;
    const labelElement: HTMLInputElement =
        fixture.debugElement.query(By.css('label')).nativeElement;

    expect(inputElement.id).toBeTruthy();
    expect(inputElement.id).toEqual(labelElement.getAttribute('for'));
  });

  it('should not overwrite existing id', () => {
    let fixture = TestBed.createComponent(MdInputWrapperWithId);
    fixture.detectChanges();

    const inputElement: HTMLInputElement =
        fixture.debugElement.query(By.css('input')).nativeElement;
    const labelElement: HTMLInputElement =
        fixture.debugElement.query(By.css('label')).nativeElement;

    expect(inputElement.id).toBe('test-id');
    expect(labelElement.getAttribute('for')).toBe('test-id');
  });

  it('validates there\'s only one hint label per side', () => {
    let fixture = TestBed.createComponent(MdInputWrapperInvalidHintTestController);

    expect(() => fixture.detectChanges()).toThrow();
    // TODO(jelbourn): .toThrow(new MdInputWrapperDuplicatedHintError('start'));
    // See https://github.com/angular/angular/issues/8348
  });

  it('validates there\'s only one hint label per side (attribute)', () => {
    let fixture = TestBed.createComponent(MdInputWrapperInvalidHint2TestController);

    expect(() => fixture.detectChanges()).toThrow();
    // TODO(jelbourn): .toThrow(new MdInputWrapperDuplicatedHintError('start'));
    // See https://github.com/angular/angular/issues/8348
  });

  it('validates there\'s only one placeholder', () => {
    let fixture = TestBed.createComponent(MdInputWrapperInvalidPlaceholderTestController);

    expect(() => fixture.detectChanges()).toThrow();
    // TODO(jelbourn): .toThrow(new MdInputWrapperPlaceholderConflictError());
    // See https://github.com/angular/angular/issues/8348
  });

  it('validates the type', () => {
    let fixture = TestBed.createComponent(MdInputWrapperInvalidTypeTestController);

    // Technically this throws during the OnChanges detection phase,
    // so the error is really a ChangeDetectionError and it becomes
    // hard to build a full exception to compare with.
    // We just check for any exception in this case.
    expect(() => fixture.detectChanges()).toThrow(
        /* new MdInputWrapperUnsupportedTypeError('file') */);
  });

  it('supports hint labels attribute', () => {
    let fixture = TestBed.createComponent(MdInputWrapperHintLabelTestController);
    fixture.detectChanges();

    // If the hint label is empty, expect no label.
    expect(fixture.debugElement.query(By.css('.md-hint'))).toBeNull();

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.md-hint'))).not.toBeNull();
  });

  it('supports hint labels elements', () => {
    let fixture = TestBed.createComponent(MdInputWrapperHintLabel2TestController);
    fixture.detectChanges();

    // In this case, we should have an empty <md-hint>.
    let el = fixture.debugElement.query(By.css('md-hint')).nativeElement;
    expect(el.textContent).toBeFalsy();

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('md-hint')).nativeElement;
    expect(el.textContent).toBe('label');
  });

  it('supports placeholder attribute', async(() => {
    let fixture = TestBed.createComponent(MdInputWrapperPlaceholderAttrTestComponent);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label'));
    expect(el).toBeNull();

    fixture.componentInstance.placeholder = 'Other placeholder';
    fixture.detectChanges();

    waitForMutationObserver(fixture, () => {
      el = fixture.debugElement.query(By.css('label'));
      expect(el).not.toBeNull();
      expect(el.nativeElement.textContent).toMatch('Other placeholder');
      expect(el.nativeElement.textContent).not.toMatch(/\*/g);
    });
  }));

  it('supports placeholder element', async(() => {
    let fixture = TestBed.createComponent(MdInputWrapperPlaceholderElementTestComponent);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label'));
    expect(el).not.toBeNull();
    expect(el.nativeElement.textContent).toMatch('Default Placeholder');

    fixture.componentInstance.placeholder = 'Other placeholder';
    fixture.detectChanges();

    waitForMutationObserver(fixture, () => {
      el = fixture.debugElement.query(By.css('label'));
      expect(el).not.toBeNull();
      expect(el.nativeElement.textContent).toMatch('Other placeholder');
      expect(el.nativeElement.textContent).not.toMatch(/\*/g);
    });
  }));

  it('supports placeholder required star', () => {
    let fixture = TestBed.createComponent(MdInputWrapperPlaceholderRequiredTestComponent);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label'));
    expect(el).not.toBeNull();
    expect(el.nativeElement.textContent).toMatch(/hello\s+\*/g);
  });

  it('supports the disabled attribute', async(() => {
    let fixture = TestBed.createComponent(MdInputWrapperWithDisabled);
    fixture.detectChanges();

    let underlineEl = fixture.debugElement.query(By.css('.md-input-underline')).nativeElement;
    expect(underlineEl.classList.contains('md-disabled')).toBe(false, 'should not be disabled');

    fixture.componentInstance.disabled = true;
    fixture.detectChanges();
    waitForMutationObserver(fixture, () => {
      expect(underlineEl.classList.contains('md-disabled')).toBe(true, 'should be disabled');
    });
  }));

  it('supports textarea', () => {
    let fixture = TestBed.createComponent(MdTextareaWithBindings);
    fixture.detectChanges();

    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    expect(textarea).not.toBeNull();
  });
});

@Component({
  template: `<md-input-wrapper><input md-input id="test-id" placeholder="test"></md-input-wrapper>`
})
class MdInputWrapperWithId {}

@Component({
  template: `<md-input-wrapper><input md-input [disabled]="disabled"></md-input-wrapper>`
})
class MdInputWrapperWithDisabled {
  disabled: boolean;
}

@Component({
  template: `<md-input-wrapper><input md-input required placeholder="hello"></md-input-wrapper>`
})
class MdInputWrapperPlaceholderRequiredTestComponent {}

@Component({
  template: `
    <md-input-wrapper>
      <input md-input>
      <md-placeholder>{{placeholder}}</md-placeholder>
    </md-input-wrapper>`
})
class MdInputWrapperPlaceholderElementTestComponent {
  placeholder: string = 'Default Placeholder';
}

@Component({
  template: `<md-input-wrapper><input md-input [placeholder]="placeholder"></md-input-wrapper>`
})
class MdInputWrapperPlaceholderAttrTestComponent {
  placeholder: string = '';
}

@Component({
  template: `<md-input-wrapper><input md-input><md-hint>{{label}}</md-hint></md-input-wrapper>`
})
class MdInputWrapperHintLabel2TestController {
  label: string = '';
}

@Component({
  template: `<md-input-wrapper [hintLabel]="label"><input md-input></md-input-wrapper>`
})
class MdInputWrapperHintLabelTestController {
  label: string = '';
}

@Component({
  template: `<md-input-wrapper><input md-input type="file"></md-input-wrapper>`
})
class MdInputWrapperInvalidTypeTestController {}

@Component({
  template: `
    <md-input-wrapper>
      <input md-input placeholder="Hello">
      <md-placeholder>World</md-placeholder>
    </md-input-wrapper>`
})
class MdInputWrapperInvalidPlaceholderTestController {}

@Component({
  template: `
    <md-input-wrapper hintLabel="Hello">
      <input md-input>
      <md-hint>World</md-hint>
    </md-input-wrapper>`
})
class MdInputWrapperInvalidHint2TestController {}

@Component({
  template: `
    <md-input-wrapper>
      <input md-input>
      <md-hint>Hello</md-hint>
      <md-hint>World</md-hint>
    </md-input-wrapper>`
})
class MdInputWrapperInvalidHintTestController {}

@Component({
  template: `<md-input-wrapper><input md-input [(ngModel)]="model"></md-input-wrapper>`
})
class MdInputWrapperBaseTestController {
  model: any = '';
}

@Component({
  template: `
    <md-input-wrapper>
      <input md-input type="date" placeholder="Placeholder">
    </md-input-wrapper>`
})
class MdInputWrapperDateTestController {}

@Component({
  template: `
    <md-input-wrapper>
      <input md-input type="text" placeholder="Placeholder">
    </md-input-wrapper>`
})
class MdInputWrapperTextTestController {}

@Component({
  template: `
    <md-input-wrapper>
      <input md-input type="password" placeholder="Placeholder">
    </md-input-wrapper>`
})
class MdInputWrapperPasswordTestController {}

@Component({
  template: `
    <md-input-wrapper>
      <input md-input type="number" placeholder="Placeholder">
    </md-input-wrapper>`
})
class MdInputWrapperNumberTestController {}

@Component({
  template: `
    <md-input-wrapper>
      <textarea md-input [rows]="rows" [cols]="cols" [wrap]="wrap" placeholder="Snacks"></textarea>
    </md-input-wrapper>`
})
class MdTextareaWithBindings {
  rows: number = 4;
  cols: number = 8;
  wrap: string = 'hard';
}

function waitForMutationObserver<T>(fixture: ComponentFixture<T>, f: () => void) {
  setTimeout(() => {
    fixture.detectChanges();
    f();
  }, 0);
}
