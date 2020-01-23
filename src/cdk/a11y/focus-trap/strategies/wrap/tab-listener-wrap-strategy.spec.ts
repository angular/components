import {MutationObserverFactory} from '@angular/cdk/observers';
import {AfterViewInit, Component, ElementRef, Type, ViewChild} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {
  A11yModule,
  ConfigurableFocusTrap,
  ConfigurableFocusTrapFactory,
  FOCUS_TRAP_WRAP_STRATEGY,
  TabListenerFocusTrapWrapStrategy
} from '../../../index';

describe('TabListenerFocusTrapWrapStrategy', () => {
  const providers: Array<Object> = [
    {provide: FOCUS_TRAP_WRAP_STRATEGY, useValue: new TabListenerFocusTrapWrapStrategy()}];

  it('Wraps Tab from last element to first', () => {
    const fixture = createComponent(SimpleFocusTrap, providers);
    const componentInstance = fixture.componentInstance;
    fixture.detectChanges();

    componentInstance.lastFocusable.nativeElement.focus();

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
    });

    componentInstance.lastFocusable.nativeElement.dispatchEvent(event);

    expect(document.activeElement).toBe(componentInstance.firstFocusable.nativeElement);
  });

  it('Wraps Shift-Tab from first element to last', () => {
    const fixture = createComponent(SimpleFocusTrap, providers);
    const componentInstance = fixture.componentInstance;
    fixture.detectChanges();

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
    });

    componentInstance.firstFocusable.nativeElement.dispatchEvent(event);

    expect(document.activeElement).toBe(componentInstance.lastFocusable.nativeElement);
  });

  it('Updates cached first/last elements when the DOM changes', () => {
    const callbacks: Function[] = [];
    const invokeCallbacks = (args?: {}) => {
      callbacks.forEach(callback => {
        callback(args);
      });
    };

    const mutationObserverProviders: Array<Object> = [{
      provide: MutationObserverFactory,
      useValue: {
        create: (callback: Function) => {
          callbacks.push(callback);

          return {observe: () => {}, disconnect: () => {}};
        }
      }
    }];

    const fixture = createComponent(SimpleFocusTrap, providers.concat(mutationObserverProviders));
    const componentInstance = fixture.componentInstance;
    fixture.detectChanges();

    componentInstance.lastFocusable.nativeElement.focus();

    const newFirstFocusable = document.createElement('textarea');
    componentInstance.focusTrapElement.nativeElement.insertBefore(
      newFirstFocusable, componentInstance.firstFocusable.nativeElement);

    // Invoke fake MutationObserver callback
    invokeCallbacks();

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
    });

    componentInstance.lastFocusable.nativeElement.dispatchEvent(event);

    expect(document.activeElement).toBe(newFirstFocusable);
  });
});

function createComponent<T>(componentType: Type<T>, providers: Array<Object> = []
  ): ComponentFixture<T> {
    TestBed.configureTestingModule({
      imports: [A11yModule],
      declarations: [componentType],
      providers: providers
    }).compileComponents();

    return TestBed.createComponent<T>(componentType);
  }

@Component({
  template: `
    <div #focusTrapElement>
      <input #firstFocusable>
      <button #lastFocusable>SAVE</button>
    </div>
    `
})
class SimpleFocusTrap implements AfterViewInit {
  @ViewChild('focusTrapElement') focusTrapElement!: ElementRef;
  @ViewChild('firstFocusable') firstFocusable!: ElementRef;
  @ViewChild('lastFocusable') lastFocusable!: ElementRef;

  focusTrap: ConfigurableFocusTrap;

  constructor(private _focusTrapFactory: ConfigurableFocusTrapFactory) {
  }

  ngAfterViewInit() {
    this.focusTrap = this._focusTrapFactory.create(this.focusTrapElement.nativeElement);
  }
}
