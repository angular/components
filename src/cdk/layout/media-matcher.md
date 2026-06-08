### MediaMatcher

`MediaMatcher` is an injectable service that provides access to the `matchMedia` method, if
available on the platform.

#### Example
```ts
@Component({ ... })
export class MyWidget {
  private mediaMatcher = inject(MediaMatcher);

  checkOrientation() {
    this.mediaMatcher.matchMedia('(orientation: landscape)').matches ?
      this.setLandscapeMode() :
      this.setPortraitMode();
  }
}
```

