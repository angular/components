import {
  AfterViewInit,
  Component,
  ElementRef,
  Provider,
  Type,
  ViewChild,
  inject,
} from '@angular/core';
import {ComponentFixture, TestBed, fakeAsync, flush} from '@angular/core/testing';
import {patchElementFocus} from '../../testing/private';
import {
  A11yModule,
  ConfigurableFocusTrap,
  ConfigurableFocusTrapFactory,
  EventListenerFocusTrapInertStrategy,
  FOCUS_TRAP_INERT_STRATEGY,
} from '../index';

describe('EventListenerFocusTrapInertStrategy', () => {
  const providers = [
    {provide: FOCUS_TRAP_INERT_STRATEGY, useValue: new EventListenerFocusTrapInertStrategy()},
  ];

  it('refocuses the first FocusTrap element when focus moves outside the FocusTrap', fakeAsync(() => {
    const fixture = createComponent(SimpleFocusTrap, providers);
    const componentInstance = fixture.componentInstance;
    fixture.detectChanges();

    componentInstance.outsideFocusableElement.nativeElement.focus();
    flush();

    expect(componentInstance.activeElement)
      .withContext('Expected first focusable element to be focused')
      .toBe(componentInstance.firstFocusableElement.nativeElement);
  }));

  it('does not intercept focus when focus moves to another element in the FocusTrap', fakeAsync(() => {
    const fixture = createComponent(SimpleFocusTrap, providers);
    const componentInstance = fixture.componentInstance;
    fixture.detectChanges();
    flush();

    componentInstance.secondFocusableElement.nativeElement.focus();
    flush();

    expect(componentInstance.activeElement)
      .withContext('Expected second focusable element to be focused')
      .toBe(componentInstance.secondFocusableElement.nativeElement);
  }));

  it('should not intercept focus if it moved outside the trap and back in again', fakeAsync(() => {
    const fixture = createComponent(SimpleFocusTrap, providers);
    fixture.detectChanges();
    flush();
    const {secondFocusableElement, outsideFocusableElement} = fixture.componentInstance;

    outsideFocusableElement.nativeElement.focus();
    secondFocusableElement.nativeElement.focus();
    flush();

    expect(fixture.componentInstance.activeElement)
      .withContext('Expected second focusable element to be focused')
      .toBe(secondFocusableElement.nativeElement);
  }));
});

function createComponent<T>(
  componentType: Type<T>,
  providers: Provider[] = [],
): ComponentFixture<T> {
  TestBed.configureTestingModule({
    imports: [A11yModule, componentType],
    providers: providers,
  });

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
  standalone: true,
})
class SimpleFocusTrap implements AfterViewInit {
  private _focusTrapFactory = inject(ConfigurableFocusTrapFactory);

  @ViewChild('focusTrapElement') focusTrapElement!: ElementRef<HTMLElement>;
  @ViewChild('outsideFocusable') outsideFocusableElement!: ElementRef<HTMLElement>;
  @ViewChild('firstFocusable') firstFocusableElement!: ElementRef<HTMLElement>;
  @ViewChild('secondFocusable') secondFocusableElement!: ElementRef<HTMLElement>;

  focusTrap: ConfigurableFocusTrap;

  // Since our custom stubbing in `patchElementFocus` won't update
  // the `document.activeElement`, we need to keep track of it here.
  activeElement: Element | null;

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
