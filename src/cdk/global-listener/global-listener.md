The global listener is a service designed to optimize listening by reducing the number of event
listeners attached to the DOM.

### GlobalListener.listen()

The `GlobalListener.listen()` is intended to be a more performant replacement for basic uses of
`EventTarget.addEventListener()`. `GlobalListener` lazily attaches a single event listener to the
`document` and only triggers the given callback if the event happens to the specified element or
one of its children.

#### Drawbacks

- Does not trigger callbacks in the same order that `EventTarget.addEventListener()` would.
- Uses passive event listening which means that the callback function specified can never call
`Event.preventDefault()`.
- Listens to the capture phase which means that events will be dispatched to the given handlers
before being dispatched to any `EventTarget` in the DOM tree.


<!-- example(cdk-global-listener-overview) -->

#### Basic Usage

In the example below, MyButton is listening for 'click' events on the host button element. Even if
we render 100 buttons in the DOM, because MyButton uses `GlobalListener.listen()` the number of
event listeners will still be one.

```typescript
import {Directive, ElementRef, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';
import {GlobalListener} from '@angular/cdk/global-listener';

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

  onClick(event: Event) {
    console.log('click!', event);
  }
}
```

