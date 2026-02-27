### BreakpointObserver

`BreakpointObserver` is an injectable service that lets you evaluate media queries to determine
the current screen size and react to changes when the viewport size crosses a breakpoint.

A set of breakpoints is provided based on the Material Design
[breakpoint system](https://material.io/guidelines/layout/responsive-ui.html#responsive-ui-breakpoints).

#### Example
```ts
@Component({ ... })
export class MyWidget {
  private breakpointObserver = inject(BreakpointObserver);

  constructor() {
    this.breakpointObserver.observe(Handset).subscribe((state: BreakpointState) => {
      if (state.matches) {
        this.makeEverythingFitOnSmallScreen();
      } else {
        this.expandEverythingToFillTheScreen();
      }
    });
  }
}
```

