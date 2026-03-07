Utility functions for coercing `@Input`s into specific types.

### Relation to Angular's built-in input transforms

Angular provides built-in equivalents for the most common coercion functions:

| CDK coercion               | Angular built-in     |
|----------------------------|----------------------|
| `coerceBooleanProperty`    | `booleanAttribute`   |
| `coerceNumberProperty`     | `numberAttribute`    |

For new code, prefer Angular's built-in transforms with signal inputs:

```ts
import {Component, input} from '@angular/core';
import {booleanAttribute, numberAttribute} from '@angular/core';

@Component({
  selector: 'my-button',
  host: {
    '[disabled]': 'disabled()',
    '(click)': 'greet()',
  }
})
class MyButton {
  disabled = input(false, {transform: booleanAttribute});
  greetDelay = input(0, {transform: numberAttribute});

  greet() {
    setTimeout(() => alert('Hello!'), this.greetDelay());
  }
}
```

The CDK coercion functions remain useful when you need custom coercion
logic that goes beyond simple boolean or number conversion, such as
`coerceElement` or `coerceArray`.

### Example

```ts
import {Component, ElementRef, input} from '@angular/core';
import {coerceElement} from '@angular/cdk/coercion';
import {booleanAttribute, numberAttribute} from '@angular/core';

@Component({
  selector: 'my-button',
  host: {
    '[disabled]': 'disabled()',
    '(click)': 'greet()',
  }
})
class MyButton {
  // Angular's `booleanAttribute` allows the disabled value of a button to be set as
  // `<my-button disabled></my-button>` instead of `<my-button [disabled]="true"></my-button>`.
  disabled = input(false, {transform: booleanAttribute});

  // Angular's `numberAttribute` turns any value coming in from the view into a number, allowing the
  // consumer to use a shorthand string while storing the parsed number in memory.
  // E.g. `<my-button greetDelay="500"></my-button>` instead of
  // `<my-button [greetDelay]="500"></my-button>`.
  greetDelay = input(0, {transform: numberAttribute});

  greet() {
    setTimeout(() => alert('Hello!'), this.greetDelay());
  }

  // `coerceElement` allows you to accept either an `ElementRef`
  // or a raw DOM node and to always return a DOM node.
  getElement(elementOrRef: ElementRef<HTMLElement> | HTMLElement): HTMLElement {
    return coerceElement(elementOrRef);
  }
}
```
