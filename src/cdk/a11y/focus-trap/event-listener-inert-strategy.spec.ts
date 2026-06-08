import {
  AfterViewInit,
  Component,
  ElementRef,
  Provider,
  Type,
  ViewChild,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {patchElementFocus} from '../../testing/private';
import {
  ConfigurableFocusTrap,
  ConfigurableFocusTrapFactory,
  EventListenerFocusTrapInertStrategy,
  FOCUS_TRAP_INERT_STRATEGY,
} from '../index';

describe('EventListenerFocusTrapInertStrategy', () => {
  const providers = [
    {provide: FOCUS_TRAP_INERT_STRATEGY, useValue: new EventListenerFocusTrapInertStrategy()},
  ];

  it('refocuses the first FocusTrap element when focus moves outside the FocusTrap', async () => {
    const fixture = createComponent(SimpleFocusTrap, providers);
    const componentInstance = fixture.componentInstance;
    fixture.detectChanges();

    // Focus something outside the FocusTrap.
    document.body.focus();
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(componentInstance.activeElement)
      .withContext('Expected first focusable element to be focused')
      .toBe(componentInstance.firstFocusableElement.nativeElement);
  });

  it('does not intercept focus when focus moves to another element in the FocusTrap', async () => {
    const fixture = createComponent(SimpleFocusTrap, providers);
    const componentInstance = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    componentInstance.secondFocusableElement.nativeElement.focus();
    await fixture.whenStable();

    expect(componentInstance.activeElement)
      .withContext('Expected second focusable element to be focused')
      .toBe(componentInstance.secondFocusableElement.nativeElement);
  });

  it('should not intercept focus if it moved outside the trap and back in again', async () => {
    const fixture = createComponent(SimpleFocusTrap, providers);
    fixture.detectChanges();
    await fixture.whenStable();
    const {secondFocusableElement, outsideFocusableElement} = fixture.componentInstance;

    outsideFocusableElement.nativeElement.focus();
    secondFocusableElement.nativeElement.focus();
    await fixture.whenStable();

    expect(fixture.componentInstance.activeElement)
      .withContext('Expected second focusable element to be focused')
      .toBe(secondFocusableElement.nativeElement);
  });
});

function createComponent<T>(
  componentType: Type<T>,
  providers: Provider[] = [],
): ComponentFixture<T> {
  TestBed.configureTestingModule({providers});

  return TestBed.createComponent<T>(componentType);
}

@Component({
  template: `
    <textarea #outsideFocusable></textarea>
    <div #focusTrapElement>
      <input #firstFocusable>
      <button #secondFocusable>SAVE</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
})
class SimpleFocusTrap implements AfterViewInit {
  private _focusTrapFactory = inject(ConfigurableFocusTrapFactory);

  @ViewChild('focusTrapElement') focusTrapElement!: ElementRef<HTMLElement>;
  @ViewChild('outsideFocusable') outsideFocusableElement!: ElementRef<HTMLElement>;
  @ViewChild('firstFocusable') firstFocusableElement!: ElementRef<HTMLElement>;
  @ViewChild('secondFocusable') secondFocusableElement!: ElementRef<HTMLElement>;

  focusTrap!: ConfigurableFocusTrap;

  // Since our custom stubbing in `patchElementFocus` won't update
  // the `document.activeElement`, we need to keep track of it here.
  activeElement: Element | null = null;

  ngAfterViewInit() {
    // Ensure consistent focus timing across browsers.
    [
      this.focusTrapElement,
      this.outsideFocusableElement,
      this.firstFocusableElement,
      this.secondFocusableElement,
    ].forEach(({nativeElement}) => {
      patchElementFocus(nativeElement);
      nativeElement.addEventListener(
        'focus',
        event => (this.activeElement = event.target as Element),
      );
    });

    this.focusTrap = this._focusTrapFactory.create(this.focusTrapElement.nativeElement);
    spyOnProperty(document, 'activeElement', 'get').and.callFake(() => this.activeElement);
    this.focusTrap.focusFirstTabbableElementWhenReady();
  }
}
