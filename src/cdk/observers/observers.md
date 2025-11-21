The `observers` package provides convenience directives built on top of native web platform
observers, such as MutationObserver.


### cdkObserveContent

A directive for observing when the content of the host element changes. An event is emitted when a
mutation to the content is observed.

```html
<div class="projected-content-wrapper" (cdkObserveContent)="projectContentChanged()">
  <ng-content></ng-content>
</div>
```

Directive also can be used for observing any type of content
```html
<div class="content-wrapper" (click)="changeText()" (cdkObserveContent)="textChanged()">
  {{ text }}
</div>
```
