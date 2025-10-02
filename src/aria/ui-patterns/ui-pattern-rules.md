# UI Patterns

## Conceptual Description

Accessibility patterns are established, reusable solutions for creating accessible web content and
applications. Some common accessibility patterns include the Tree View, Switch, Listbox, and Grid.

Behaviors are TypeScript classes that encapsulate the common behaviors of Accessibility Patterns.
Some common behaviors include navigation and selection.

UI Patterns are TypeScript classes that encapsulate Accessibility Patterns. UI Patterns are built
by utilizing multiple Behavior classes to implement the complete functionality of an Accessibility
Pattern.

## Authoring Guidelines

### License Header

All .ts files should begin with an @license comment.

```ts
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
```

### Imports

- Imports should be at the top of the file and kept in alphabetical order.
- The only allowed external APIs are `signal`, and `computed` from `@angular/core`.
- All other dependencies must come from inside of the ui-patterns folder.

### Type Definition

Each UI Pattern defines a type for it's constructor arguments.

All inputs must be signals. Inputs must not use the `Signal` or `WritableSignal` types from
`@angular/core`. Instead, they must use the `SignalLike` and `WritableSignalLike` types from
`ui-patterns/behaviors/signal-like`.

```ts
export interface ExampleInputs extends Behavior1Inputs, Behavior2Inputs {
  // Additional inputs.
}
```

### Class Definition

#### How to instantiate Behaviors

All Behaviors are defined as class variables and instantiated in the constructor of the UI Pattern.

#### Core Methods

Each UI Pattern implements the following core methods:

- `validate()`
- `setDefaultState()`
- `onKeydown()`
- `onPointerdown()`

```ts
// License...

// Imports...

// Type Definition...

export class ExamplePattern {
  /** Controls behavior1 for the accessiblity pattern. */
  behavior1: Behavior1;

  /** Controls behavior2 for the accessiblity pattern. */
  behavior2: Behavior2;

  constructor(inputs: ExampleInputs) {
    this.behavior1 = new Behavior1(inputs);
    this.behavior2 = new Behavior2(inputs);
  }

  /** Checks that the internal state of the pattern is valid. */
  validate(): string[] {}

  /** Sets the default initial state of the accessibility pattern. */
  setDefaultState(): void {}

  /** Handles keydown events for the accessibility pattern. */
  onKeydown(event: KeyboardEvent) {}

  /** Handles pointer events for the accessibility pattern. */
  onPointerdown(event: PointerEvent) {}
}
```

#### Event Handlers

Event handlers for UI Patterns are authored utilizing the EventManager system from
`ui-patterns/behaviors/event-manager`. The event-manager system exposes two primary event manager
classes: `KeyboardEventManager` and `PointerEventManager`.

```ts
// License...

// Imports...

// Type Definition...

export class ExamplePattern {
  // Behaviors...

  /** The keydown event manager for the accessibility pattern. */
  keydown = computed(() => {
    return new KeyboardEventManager()
      .on('ArrowUp', () => { /* Arrow up logic. */ })
      .on('ArrowDown', () => { /* Arrow down logic. */ });
  });

  /** The pointerdown event manager for the listbox. */
  pointerdown = computed(() => {
    return new PointerEventManager().on(() => {/* Pointerdown logic. */});
  });

  // Constructor...

  // Core Methods...

  /** Handles keydown events for the accessibility pattern. */
  onKeydown(event: KeyboardEvent) {
    this.keydown().handle(event);
  }

  /** Handles pointer events for the accessibility pattern. */
  onPointerdown(event: PointerEvent) {
    this.pointerdown().handle(event);
  }
}
```

##### KeyboardEventManager Expanded

The `KeyboardEventManager` class can accept strings, signals, and regular expressions as keys.

```ts
  /** The key used to navigate to the next item in the list. */
  nextKey = computed(() => { .. });

  /** The key used to navigate to the next item in the list. */
  prevKey = computed(() => { ... });

  /** The keydown event manager for the accessibility pattern. */
  keydown = computed(() => {
    return new KeyboardEventManager()
      .on(prevKey, () => { /* Navigate prev logic. */ })
      .on(nextKey, () => { /* Navigate next logic. */ });
  });
```

The `KeyboardEventManager` can also accept a `Modifier` argument for handling modifier keys.

```ts
  /** The keydown event manager for the accessibility pattern. */
  keydown = computed(() => {
    return new KeyboardEventManager()
      .on(Modifier.Shift, 'ArrowUp', () => {
        /* Arrow up while holding shift logic. */
      });
  });
```

The `Modifier` argument can be an array of modifier keys for defining the same behavior with
multiple different modifier keys.

```ts
  /** The keydown event manager for the accessibility pattern. */
  keydown = computed(() => {
    return new KeyboardEventManager()
      .on([Modifier.Ctrl, Modifier.Meta], 'ArrowUp', () => {
        /* Arrow up while holding ctrl OR meta logic. */
      });
  });
```

Holding multiple `Modifier` keys when performing a keydown event can be represented by using the
bitwise OR operator.

```ts
  /** The keydown event manager for the accessibility pattern. */
  keydown = computed(() => {
    return new KeyboardEventManager()
      .on(Modifier.Ctrl | Modifier.Shift, 'ArrowUp', () => {
        /* Arrow up while holding ctrl + shift logic. */
      });
  });
```

##### PointerEventManager Expanded

The `PointerEventManager` can also accept a `Modifier` argument for handling modifier keys.

```ts
  /** The pointerdown event manager for the accessibility pattern. */
  pointerdown = computed(() => {
    return new PointerEventManager()
      .on(Modifier.Shift, (e) => {
        /* Pointerdown while holding shift logic. */
      });
  });
```

The `Modifier` argument can be an array of modifier keys for defining the same behavior with
multiple different modifier keys.

```ts
  /** The pointerdown event manager for the accessibility pattern. */
  pointerdown = computed(() => {
    return new PointerEventManager()
      .on([Modifier.Ctrl, Modifier.Meta], () => {
        /* Pointerdown while holding ctrl OR meta logic. */
      });
  });
```

Holding multiple `Modifier` keys when performing a pointerdown event can be represented by using the
bitwise OR operator.

```ts
  /** The pointerdown event manager for the accessibility pattern. */
  pointerdown = computed(() => {
    return new PointerEventManager()
      .on(Modifier.Ctrl | Modifier.Shift, () => {
        /* Pointerdown while holding ctrl + shift logic. */
      });
  });
```
