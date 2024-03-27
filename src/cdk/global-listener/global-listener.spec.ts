import {
  Component,
  Directive,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Subscription} from 'rxjs';
import {GlobalListener} from './global-listener';

describe('GlobalListener', () => {
  let fixture: ComponentFixture<ButtonDemo>;
  let myButtons: QueryList<MyButton>;

  beforeEach(() => {
    TestBed.configureTestingModule({declarations: [ButtonDemo, MyButton]}).compileComponents();
    fixture = TestBed.createComponent(ButtonDemo);
    fixture.detectChanges();
    myButtons = fixture.componentInstance.myButtons;
  });

  it('should call the click handler when a click event occurs', () => {
    const button = myButtons.get(0)!;
    spyOn(button, 'onClick');
    expect(button.onClick).not.toHaveBeenCalled();

    button.elementRef.nativeElement.click();
    expect(button.onClick).toHaveBeenCalledTimes(1);

    button.elementRef.nativeElement.click();
    button.elementRef.nativeElement.click();
    expect(button.onClick).toHaveBeenCalledTimes(3);
  });

  it('should only call the handler for the button that the event happened on', () => {
    const button0 = myButtons.get(0)!;
    const button1 = myButtons.get(1)!;

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

  it('should call the handler if the event target is a child of the specified element', () => {
    const buttonText = fixture.componentInstance.buttonText.nativeElement;
    const button = myButtons.get(2)!;
    spyOn(button, 'onClick');
    expect(button.onClick).toHaveBeenCalledTimes(0);

    buttonText.click();
    expect(button.onClick).toHaveBeenCalledTimes(1);
  });
});

@Directive({
  selector: 'button[my-button]',
})
class MyButton implements OnDestroy {
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
    <button my-button>Button #1</button>
    <button my-button>Button #2</button>
    <button my-button><span #buttonText>Button #3</span></button>
  `,
})
export class ButtonDemo {
  @ViewChildren(MyButton) myButtons: QueryList<MyButton>;
  @ViewChild('buttonText') buttonText: ElementRef<HTMLElement>;
}
