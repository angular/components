**Warning: this component is still experimental. It may have bugs and the API may change at any
time**

The scrolling package provides helpers for working with the system clipboard.

## The `Clipboard` service

The `Clipboard` service copies text to the
user's clipboard. It has two methods, `copy` and `beginCopy`. For cases where
you are copying a relatively small amount of text, you can just call `copy` to
place it on the clipboard.

```typescript
class MyCopier {
  constructor(private clipboard: Clipboard) {}

  copy() {
    this.clipboard.copy('Hello clipboard!');
  }
}
```

However, for a large amount of text the browser needs time to load it into a
hidden textarea where it can be copied. Just calling `copy` directly may fail in
this case, so you can pre-load the text by calling `beginCopy`. This method
returns a `PendingCopy` object that has a `copy` method to finish copying the
text that was buffered. Please note, if you call `beginCopy` it is up to you to
clean up the `PendingCopy` object by calling `destroy` on it after you are
finished.

```typescript
class MyCopier {
  hugeText: string;

  constructor(private clipboard: Clipboard) {}

  copy() {
    const pending = this.clipboard.beginCopy(this.hugeText);
    let remainingAttempts = 3;
    const attempt = () => {
      const result = pending.copy();
      if (!result && --remainingAttempts) {
        setTimeout(attempt);
      } else {
        // Remember to destroy when you're done!
        pending.destroy();
      }
    }
    setTimeout(attempt);
  }
}
```

## The `cdkCopyToClipboard` directive

The `cdkCopyToClipboard` directive can be used to easily add copy-on-click
functionality to an existing element. The directive selector doubles as an
`@Input()` for the text to be copied.

```html
<img src="doge.jpg" alt="Doge" [xapCopyToClipboard]="getDogeSpeakText()">
```
