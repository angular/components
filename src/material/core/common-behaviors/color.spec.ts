import {TestBed} from '@angular/core/testing';
import {mixinColor} from './color';
import {Component, ElementRef, Inject} from '@angular/core';

describe('MixinColor', () => {
  it('should augment an existing class with a color property', () => {
    @Component({})
    class TestComponent extends mixinColor(BaseComponent) {
      constructor(elementRef: ElementRef) {
        super(elementRef);
      }
    }

    TestBed.configureTestingModule({
      imports: [],
      declarations: [TestComponent],
    });

    const fixture = TestBed.createComponent(TestComponent);
    const instance = fixture.componentInstance;

    expect(instance.color)
      .withContext('Expected the mixed-into class to have a color property')
      .toBeFalsy();

    instance.color = 'accent';

    expect(instance.color)
      .withContext('Expected the mixed-into class to have an updated color property')
      .toBe('accent');
  });

  it('should remove old color classes if new color is set', () => {
    @Component({})
    class TestComponent extends mixinColor(BaseComponent) {
      constructor(elementRef: ElementRef) {
        super(elementRef);
      }
    }

    TestBed.configureTestingModule({
      imports: [],
      declarations: [TestComponent],
    });

    const fixture = TestBed.createComponent(TestComponent);
    const instance = fixture.componentInstance;
    const testElement = instance._elementRef.nativeElement;

    expect(testElement.classList.length)
      .withContext('Expected the element to not have any classes at initialization')
      .toBe(0);

    instance.color = 'primary';

    expect(testElement.classList)
      .withContext('Expected the element to have the "mat-primary" class set')
      .toContain('mat-primary');

    instance.color = 'accent';

    expect(testElement.classList).not.toContain(
      'mat-primary',
      'Expected the element to no longer have "mat-primary" set.',
    );
    expect(testElement.classList)
      .withContext('Expected the element to have the "mat-accent" class set')
      .toContain('mat-accent');
  });

  it('should allow having no color set', () => {
    @Component({})
    class TestComponent extends mixinColor(BaseComponent) {
      constructor(elementRef: ElementRef) {
        super(elementRef);
      }
    }

    TestBed.configureTestingModule({
      imports: [],
      declarations: [TestComponent],
    });

    const fixture = TestBed.createComponent(TestComponent);
    const instance = fixture.componentInstance;
    const testElement = instance._elementRef.nativeElement;

    expect(testElement.classList.length)
      .withContext('Expected the element to not have any classes at initialization')
      .toBe(0);

    instance.color = 'primary';

    expect(testElement.classList)
      .withContext('Expected the element to have the "mat-primary" class set')
      .toContain('mat-primary');

    instance.color = undefined;

    expect(testElement.classList.length)
      .withContext('Expected the element to have no color class set.')
      .toBe(0);
  });

  it('should allow having a default color if specified', () => {
    @Component({})
    class TestComponent extends mixinColor(BaseComponent, 'accent') {
      constructor(elementRef: ElementRef) {
        super(elementRef);
      }
    }

    TestBed.configureTestingModule({
      imports: [],
      declarations: [TestComponent],
    });

    const fixture = TestBed.createComponent(TestComponent);
    const instance = fixture.componentInstance;
    const testElement = instance._elementRef.nativeElement;

    expect(testElement.classList)
      .withContext('Expected the element to have the "mat-accent" class by default.')
      .toContain('mat-accent');

    instance.color = undefined;

    expect(testElement.classList)
      .withContext('Expected the default color "mat-accent" to be set.')
      .toContain('mat-accent');
  });

  it('should allow for the default color to change after init', () => {
    @Component({})
    class TestComponent extends mixinColor(BaseComponent, 'accent') {
      constructor(elementRef: ElementRef) {
        super(elementRef);
      }
    }

    TestBed.configureTestingModule({
      imports: [],
      declarations: [TestComponent],
    });

    const fixture = TestBed.createComponent(TestComponent);
    const instance = fixture.componentInstance;
    const testElement = instance._elementRef.nativeElement;

    expect(testElement.classList).toContain('mat-accent');

    instance.defaultColor = 'warn';
    instance.color = undefined;

    expect(testElement.classList).toContain('mat-warn');
  });
});

class BaseComponent {
  constructor(public readonly _elementRef: ElementRef) {}
}
