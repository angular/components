# Angular Material bi-directionality

## Setting a text-direction for your application

The [`dir` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/dir)
is typically applied to `<html>` or `<body>` element of a page. However, it can be used on any
element, within your Angular app, to apply a text-direction to a smaller subset of the page.

All Angular Material components automatically reflect the LTR/RTL direction
of their container.

## Reading the text-direction in your own components

`@angular/cdk/bidi` provides a `Directionality` injectable that can be used by any component
in your application.

`Directionality` provides two useful properties:
* `value`: the current text direction, either `'ltr'` or `'rtl'`.
* `change`: an `Observable` that emits whenever the text-direction changes. Note that this only
captures changes from `dir` attributes _inside the Angular application context_. It will not
emit for changes to `dir` on `<html>` and `<body>`, as they are assumed to be static.

### Example

```ts
@Component({ /* ... */ })
export class MyCustomComponent {
  private directionality = inject(Directionality);
  private dir = this.directionality.value;

  constructor() {
    this.directionality.change.subscribe(() => {
      this.dir = this.directionality.value;
    });
  }
}
```
