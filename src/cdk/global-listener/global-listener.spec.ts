import {Component, Directive, ElementRef, OnDestroy, QueryList, ViewChildren} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Subscription} from 'rxjs';
import {GlobalListener} from './global-listener';

describe('GlobalListener', () => {
  let fixture: ComponentFixture<MockButtonDemo>;
  let mockButtons: QueryList<MockButton>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MockButtonDemo, MockButton],
    }).compileComponents();
    fixture = TestBed.createComponent(MockButtonDemo);
    fixture.detectChanges();
    mockButtons = fixture.componentInstance.mockButtons;
  });

  it('should call the click handler when a click event occurs', () => {
    const button = mockButtons.get(0)!;
    spyOn(button, 'onClick');
    expect(button.onClick).not.toHaveBeenCalled();

    button.elementRef.nativeElement.click();
    expect(button.onClick).toHaveBeenCalledTimes(1);

    button.elementRef.nativeElement.click();
    button.elementRef.nativeElement.click();
    expect(button.onClick).toHaveBeenCalledTimes(3);
  });

  it('should only call the handler for the button that the event happened on', () => {
    const button0 = mockButtons.get(0)!;
    const button1 = mockButtons.get(1)!;

    spyOn(button0, 'onClick');
    spyOn(button1, 'onClick');

    button1.elementRef.nativeElement.click();

    expect(button0.onClick).toHaveBeenCalledTimes(0);
    expect(button1.onClick).toHaveBeenCalledTimes(1);

    button0.elementRef.nativeElement.click();
    button0.elementRef.nativeElement.click();

    expect(button0.onClick).toHaveBeenCalledTimes(2);
    expect(button1.onClick).toHaveBeenCalledTimes(1);
  });
});

@Directive({
  selector: '[mock-button]',
  host: {class: 'mock-button'},
})
class MockButton implements OnDestroy {
  private _subscription: Subscription;

  constructor(
    readonly globalListener: GlobalListener,
    readonly elementRef: ElementRef<HTMLInputElement>,
  ) {
    this._subscription = globalListener.listen('click', elementRef.nativeElement, event => {
      this.onClick(event);
    });
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  onClick(_: Event) {}
}

@Component({
  template: `
    <button mock-button >Mock Button #1</button>
    <button mock-button >Mock Button #2</button>
  `,
})
export class MockButtonDemo {
  @ViewChildren(MockButton) mockButtons: QueryList<MockButton>;
}
