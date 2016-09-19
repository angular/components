import {
  async,
  TestBed,
} from '@angular/core/testing';
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {MdTextarea, MdTextareaModule} from './textarea';

describe('MdTextarea', function () {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdTextareaModule, FormsModule],
      declarations: [
        MdTextareaPlaceholderRequiredTestComponent,
        MdTextareaPlaceholderElementTestComponent,
        MdTextareaPlaceholderAttrTestComponent,
        MdTextareaHintLabel2TestController,
        MdTextareaHintLabelTestController,
        MdTextareaInvalidPlaceholderTestController,
        MdTextareaInvalidHint2TestController,
        MdTextareaInvalidHintTestController,
        MdTextareaBaseTestController,
        MdTextareaAriaTestController,
        MdTextareaWithBlurAndFocusEvents,
        MdTextareaWithNameTestController,
        MdTextareaWithId,
        MdTextareaWithAutofocus,
        MdTextareaWithUnboundAutofocus,
        MdTextareaWithReadonly,
        MdTextareaWithUnboundReadonly,
        MdTextareaWithDisabled,
        MdTextareaWithUnboundDisabled,
        MdTextareaWithRequired,
        MdTextareaWithUnboundRequired,
        MdTextareaWithTabindex,
      ],
    });

    TestBed.compileComponents();
  }));

  it('creates a native <textarea> element', () => {
    let fixture = TestBed.createComponent(MdTextareaBaseTestController);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('textarea'))).toBeTruthy();
  });

  // TODO(kara): update when core/testing adds fix
  it('support ngModel', async(() => {
    let fixture = TestBed.createComponent(MdTextareaBaseTestController);

    fixture.detectChanges();
    let instance = fixture.componentInstance;
    let el: HTMLInputElement = fixture.debugElement.query(By.css('textarea')).nativeElement;

    instance.model = 'hello';
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      // Temporary workaround, see https://github.com/angular/angular/issues/10148
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(el.value).toBe('hello');
      });
    });
  }));

  it('should have a different ID for outer element and internal textarea', () => {
    let fixture = TestBed.createComponent(MdTextareaWithId);
    fixture.detectChanges();

    const componentElement: HTMLElement =
        fixture.debugElement.query(By.directive(MdTextarea)).nativeElement;
    const inputElement: HTMLInputElement =
        fixture.debugElement.query(By.css('textarea')).nativeElement;

    expect(componentElement.id).toBe('test-id');
    expect(inputElement.id).toBeTruthy();
    expect(inputElement.id).not.toBe(componentElement.id);
  });

  it('counts characters', async(() => {
    let fixture = TestBed.createComponent(MdTextareaBaseTestController);
    let instance = fixture.componentInstance;
    fixture.detectChanges();
    let inputInstance = fixture.debugElement.query(By.directive(MdTextarea)).componentInstance;
    expect(inputInstance.characterCount).toEqual(0);

    instance.model = 'hello';
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(inputInstance.characterCount).toEqual(5);
    });
  }));

  it('copies aria attributes to the inner textarea', () => {
    let fixture = TestBed.createComponent(MdTextareaAriaTestController);
    let instance = fixture.componentInstance;
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('textarea')).nativeElement;
    expect(el.getAttribute('aria-label')).toEqual('label');
    instance.ariaLabel = 'label 2';
    fixture.detectChanges();
    expect(el.getAttribute('aria-label')).toEqual('label 2');

    expect(el.getAttribute('aria-disabled')).toBeTruthy();
  });

  it(`validates there's only one hint label per side`, () => {
    let fixture = TestBed.createComponent(MdTextareaInvalidHintTestController);

    expect(() => fixture.detectChanges()).toThrow();
    // TODO(jelbourn): .toThrow(new MdTextareaDuplicatedHintError('start'));
    // See https://github.com/angular/angular/issues/8348
  });

  it(`validates there's only one hint label per side (attribute)`, () => {
    let fixture = TestBed.createComponent(MdTextareaInvalidHint2TestController);

    expect(() => fixture.detectChanges()).toThrow();
    // TODO(jelbourn): .toThrow(new MdTextareaDuplicatedHintError('start'));
    // See https://github.com/angular/angular/issues/8348
  });

  it('validates there\'s only one placeholder', () => {
    let fixture = TestBed.createComponent(MdTextareaInvalidPlaceholderTestController);

    expect(() => fixture.detectChanges()).toThrow();
    // TODO(jelbourn): .toThrow(new MdTextareaPlaceholderConflictError());
    // See https://github.com/angular/angular/issues/8348
  });

  it('supports hint labels attribute', () => {
    let fixture = TestBed.createComponent(MdTextareaHintLabelTestController);
    fixture.detectChanges();

    // If the hint label is empty, expect no label.
    expect(fixture.debugElement.query(By.css('.md-hint'))).toBeNull();

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.md-hint'))).not.toBeNull();
  });

  it('supports hint labels elements', () => {
    let fixture = TestBed.createComponent(MdTextareaHintLabel2TestController);
    fixture.detectChanges();

    // In this case, we should have an empty <md-hint>.
    let el = fixture.debugElement.query(By.css('md-hint')).nativeElement;
    expect(el.textContent).toBeFalsy();

    fixture.componentInstance.label = 'label';
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('md-hint')).nativeElement;
    expect(el.textContent).toBe('label');
  });

  it('supports placeholder attribute', () => {
    let fixture = TestBed.createComponent(MdTextareaPlaceholderAttrTestComponent);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label'));
    expect(el).toBeNull();

    fixture.componentInstance.placeholder = 'Other placeholder';
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('label'));
    expect(el).not.toBeNull();
    expect(el.nativeElement.textContent).toMatch('Other placeholder');
    expect(el.nativeElement.textContent).not.toMatch(/\*/g);
  });

  it('supports placeholder element', () => {
    let fixture = TestBed.createComponent(MdTextareaPlaceholderElementTestComponent);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label'));
    expect(el).not.toBeNull();
    expect(el.nativeElement.textContent).toMatch('Default Placeholder');

    fixture.componentInstance.placeholder = 'Other placeholder';
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('label'));
    expect(el).not.toBeNull();
    expect(el.nativeElement.textContent).toMatch('Other placeholder');
    expect(el.nativeElement.textContent).not.toMatch(/\*/g);
  });

  it('supports placeholder required star', () => {
    let fixture = TestBed.createComponent(MdTextareaPlaceholderRequiredTestComponent);
    fixture.detectChanges();

    let el = fixture.debugElement.query(By.css('label'));
    expect(el).not.toBeNull();
    expect(el.nativeElement.textContent).toMatch(/hello\s+\*/g);
  });

  it('supports blur and focus events', () => {
    let fixture = TestBed.createComponent(MdTextareaWithBlurAndFocusEvents);
    const testComponent = fixture.componentInstance;
    const inputComponent = fixture.debugElement.query(By.directive(MdTextarea)).componentInstance;
    const fakeEvent = <FocusEvent>{};

    spyOn(testComponent, 'onFocus');
    spyOn(testComponent, 'onBlur');

    expect(testComponent.onFocus).not.toHaveBeenCalled();
    expect(testComponent.onBlur).not.toHaveBeenCalled();

    inputComponent._handleFocus(fakeEvent);
    expect(testComponent.onFocus).toHaveBeenCalledWith(fakeEvent);

    inputComponent._handleBlur(fakeEvent);
    expect(testComponent.onBlur).toHaveBeenCalledWith(fakeEvent);
  });

  it('supports the autoFocus attribute', () => {
    let fixture = TestBed.createComponent(MdTextareaWithAutofocus);
    fixture.detectChanges();

    let input: MdTextarea = fixture.debugElement.query(By.directive(MdTextarea)).componentInstance;
    let el: HTMLInputElement = fixture.debugElement.query(By.css('textarea')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('autofocus')).toBeNull();

    input.autofocus = true;
    fixture.detectChanges();
    expect(el.getAttribute('autofocus')).toEqual('');
  });

  it('supports the autoFocus attribute as an unbound attribute', () => {
    let fixture = TestBed.createComponent(MdTextareaWithUnboundAutofocus);
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('textarea')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('autofocus')).toEqual('');
  });

  it('supports the disabled attribute', () => {
    let fixture = TestBed.createComponent(MdTextareaWithDisabled);
    let input: MdTextarea = fixture.debugElement.query(By.directive(MdTextarea)).componentInstance;
    input.disabled = false;
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('textarea')).nativeElement;
    expect(el).not.toBeNull();

    fixture.detectChanges();
    expect(el.getAttribute('disabled')).toEqual(null);

    fixture.componentInstance.disabled = true;
    fixture.detectChanges();
    expect(el.getAttribute('disabled')).toEqual('');
  });

  it('supports the disabled attribute as an unbound attribute', () => {
    let fixture = TestBed.createComponent(MdTextareaWithUnboundDisabled);
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('textarea')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('disabled')).toEqual('');
  });

  it('supports the readOnly attribute', () => {
    let fixture = TestBed.createComponent(MdTextareaWithReadonly);
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('textarea')).nativeElement;
    let input: MdTextarea = fixture.debugElement.query(By.directive(MdTextarea)).componentInstance;

    expect(el).not.toBeNull();
    expect(el.getAttribute('readonly')).toBeNull();

    input.readonly = true;
    fixture.detectChanges();
    expect(el.getAttribute('readonly')).toEqual('');
  });

  it('supports the readOnly attribute as an unbound attribute', () => {
    let fixture = TestBed.createComponent(MdTextareaWithUnboundReadonly);
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('Textarea')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('readonly')).toEqual('');
  });

  it('supports the required attribute', () => {
    let fixture = TestBed.createComponent(MdTextareaWithRequired);
    fixture.detectChanges();

    let input: MdTextarea = fixture.debugElement.query(By.directive(MdTextarea)).componentInstance;
    let el: HTMLInputElement = fixture.debugElement.query(By.css('textarea')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('required')).toBeNull();

    input.required = true;
    fixture.detectChanges();
    expect(el.getAttribute('required')).toEqual('');
  });

  it('supports the required attribute as an unbound attribute', () => {
    let fixture = TestBed.createComponent(MdTextareaWithUnboundRequired);
    fixture.detectChanges();

    let el: HTMLInputElement = fixture.debugElement.query(By.css('textarea')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('required')).toEqual('');
  });

  it('supports the tabIndex attribute', () => {
    let fixture = TestBed.createComponent(MdTextareaWithTabindex);
    fixture.detectChanges();

    let input: MdTextarea = fixture.debugElement.query(By.directive(MdTextarea)).componentInstance;
    let el: HTMLInputElement = fixture.debugElement.query(By.css('textarea')).nativeElement;

    expect(el).not.toBeNull();
    expect(el.getAttribute('tabindex')).toEqual(null);

    input.tabindex = 1;
    fixture.detectChanges();
    expect(el.getAttribute('tabindex')).toEqual('1');
  });

  it('supports a name attribute', () => {
    let fixture = TestBed.createComponent(MdTextareaWithNameTestController);
    const inputElement: HTMLInputElement = fixture.debugElement.query(By.css('textarea'))
        .nativeElement;
    fixture.detectChanges();

    expect(inputElement.name).toBe('some-name');
  });
});

@Component({template: `<md-textarea id="test-id"></md-textarea>`})
class MdTextareaWithId {
  value: number = 0;
}

@Component({template: `<md-textarea required placeholder="hello"></md-textarea>`})
class MdTextareaPlaceholderRequiredTestComponent {
}

@Component({template: `<md-textarea> <md-placeholder>{{placeholder}}</md-placeholder> </md-textarea>`})
class MdTextareaPlaceholderElementTestComponent {
  placeholder: string = 'Default Placeholder';
}

@Component({template: `<md-textarea [placeholder]="placeholder"></md-textarea>`})
class MdTextareaPlaceholderAttrTestComponent {
  placeholder: string = '';
}

@Component({template: `<md-textarea> <md-hint>{{label}}</md-hint> </md-textarea>`})
class MdTextareaHintLabel2TestController {
  label: string = '';
}

@Component({template: `<md-textarea [hintLabel]="label"></md-textarea>`})
class MdTextareaHintLabelTestController {
  label: string = '';
}

@Component({
  template: `
    <md-textarea placeholder="Hello">
      <md-placeholder>World</md-placeholder>
    </md-textarea>`
})
class MdTextareaInvalidPlaceholderTestController { }

@Component({
  template: `
    <md-textarea hintLabel="Hello">
      <md-hint>World</md-hint>
    </md-textarea>`
})
class MdTextareaInvalidHint2TestController { }

@Component({
  template: `
    <md-textarea>
      <md-hint>Hello</md-hint>
      <md-hint>World</md-hint>
    </md-textarea>`
})
class MdTextareaInvalidHintTestController { }

@Component({template: `<md-textarea [(ngModel)]="model"></md-textarea>`})
class MdTextareaBaseTestController {
  model: any = '';
}

@Component({template:
    `<md-textarea [aria-label]="ariaLabel" [aria-disabled]="ariaDisabled"></md-textarea>`})
class MdTextareaAriaTestController {
  ariaLabel: string = 'label';
  ariaDisabled: boolean = true;
}

@Component({template: `<md-textarea (focus)="onFocus($event)" (blur)="onBlur($event)"></md-textarea>`})
class MdTextareaWithBlurAndFocusEvents {
  onBlur(event: FocusEvent) {}
  onFocus(event: FocusEvent) {}
}

@Component({template: `<md-textarea name="some-name"></md-textarea>`})
class MdTextareaWithNameTestController { }

@Component({template: `<md-textarea [autofocus]="autoFocus"></md-textarea>`})
class MdTextareaWithAutofocus { }

@Component({template: `<md-textarea autofocus></md-textarea>`})
class MdTextareaWithUnboundAutofocus { }

@Component({template: `<md-textarea [readonly]="readOnly"></md-textarea>`})
class MdTextareaWithReadonly { }

@Component({template: `<md-textarea readonly></md-textarea>`})
class MdTextareaWithUnboundReadonly { }

@Component({template: `<md-textarea [disabled]="disabled"></md-textarea>`})
class MdTextareaWithDisabled {
  disabled: boolean;
}

@Component({template: `<md-textarea disabled></md-textarea>`})
class MdTextareaWithUnboundDisabled { }

@Component({template: `<md-textarea [required]="required"></md-textarea>`})
class MdTextareaWithRequired { }

@Component({template: `<md-textarea required></md-textarea>`})
class MdTextareaWithUnboundRequired { }

@Component({template: `<md-textarea [tabindex]="tabIndex"></md-textarea>`})
class MdTextareaWithTabindex { }