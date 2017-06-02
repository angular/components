# Scroll strategies

## What is a scroll strategy?
A scroll strategy is a way of describing how an overlay should behave if the user scrolls
while the overlay is open. The strategy has a reference to the `OverlayRef`, allowing it to
recalculate the position, close the overlay, block scrolling, etc.

## Usage
To associate an overlay with a scroll strategy, you have to pass in a function, that returns a
scroll strategy, to the `OverlayState`. By default, all overlays will use the `noop` strategy which
doesn't do anything. The other available strategies are `reposition`, `block` and `close`:

```ts
let overlayState = new OverlayState();

overlayState.scrollStrategy = scrollStrategyOptions.block;
this._overlay.create(overlayState).attach(yourPortal);
```

## Creating a custom scroll strategy
To set up a custom scroll strategy, you have to create a class that implements the `ScrollStrategy`
interface. There are three stages of a scroll strategy's life cycle:

1. When an overlay is created, it'll call the strategy's `attach` method with a reference to itself.
2. When an overlay is attached to the DOM, it'll call the `enable` method on its scroll strategy,
3. When an overlay is detached from the DOM or destroyed, it'll call the `disable` method on its
scroll strategy, allowing it to clean up after itself.

Afterwards you have to override the `ScrollStrategyOptions` provider, which is used to instantiate
the scroll strategies and to handle the dependency injection.

```ts
import {NgModule} from '@angular/core';
import {
  ScrollStrategy,
  ScrollStrategyOptions,
  ScrollStrategyOption,
  ScrollDispatcher,
  ViewportRuler,
} from '@angular/material';

// Your custom scroll strategy.
export class CustomScrollStrategy implements ScrollStrategy {
  // your implementation
}

// Provider that'll instantiate your custom strategies, as well as the built-in ones from Material.
class ScrollStrategyOptionsOverride extends ScrollStrategyOptions {
  constructor(scrollDispatcher: ScrollDispatcher, viewportRuler: ViewportRuler) {
    super(scrollDispatcher, viewportRuler);
  }

  custom: ScrollStrategyOption = () => new CustomScrollStrategy();
}

// Register the provider with your module.
@NgModule({
  providers: [
    {
      provide: ScrollStrategyOptions,
      useClass: ScrollStrategyOptionsOverride,
      deps: [ScrollDispatcher, ViewportRuler]
    }
  ]
})
export class YourModule { }
```
