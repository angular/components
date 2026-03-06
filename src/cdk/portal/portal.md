The `portals` package provides a flexible system for rendering dynamic content into an application.

### Portals
A `Portal` is a piece of UI that can be dynamically rendered to an open slot on the page.

The "piece of UI" can be either a `Component`, a `TemplateRef` or a DOM element and the "open slot" is
a `PortalOutlet`.

Portals and PortalOutlets are low-level building blocks that other concepts, such as overlays, are
built upon.

<!-- example(cdk-portal-overview) -->

##### `Portal<T>`
| Method                      | Description                         |
| --------------------------- | ----------------------------------- |
| `attach(PortalOutlet): T`   | Attaches the portal to a host.      |
| `detach(): void`            | Detaches the portal from its host.  |
| `isAttached: boolean`       | Whether the portal is attached.     |

##### `PortalOutlet`
| Method                  | Description                                 |
| ----------------------- | ------------------------------------------- |
| `attach(Portal): any`   | Attaches a portal to the host.              |
| `detach(): any`         | Detaches the portal from the host.          |
| `dispose(): void`       | Permanently dispose the host.               |
| `hasAttached: boolean`  | Whether a portal is attached to the host.   |


#### Portals in practice

##### `CdkPortal`
Used to get a portal from an `<ng-template>`. `CdkPortal` *is* a `Portal`.

Usage:
```html
<ng-template cdkPortal>
  <p>The content of this template is captured by the portal.</p>
</ng-template>

<!-- OR -->

<!-- This result here is identical to the syntax above -->
<p *cdkPortal>
  The content of this template is captured by the portal.
</p>
```

A component can use `viewChild` or `viewChildren` to get a reference to a
`CdkPortal`. Query by the `CdkPortal` class rather than a template reference variable to ensure the
query works with both syntaxes above.

```ts
import {CdkPortal} from '@angular/cdk/portal';

readonly myPortal = viewChild(CdkPortal);
```

##### `ComponentPortal`
Used to create a portal from a component type.

Usage:
```ts
ngAfterViewInit() {
  this.userSettingsPortal = new ComponentPortal(UserSettingsComponent);
}
```

##### `TemplatePortal`
You can create a `TemplatePortal` from an `<ng-template>`. `TemplatePortal` allows you to take Angular content within one template and render it somewhere else.

Usage:
```html
<ng-template #templatePortalContent>Some content here</ng-template>
```

```ts
private _viewContainerRef = inject(ViewContainerRef);

readonly templatePortalContent = viewChild<TemplateRef<unknown>>('templatePortalContent');

ngAfterViewInit() {
  this.templatePortal = new TemplatePortal(
    this.templatePortalContent()!,
    this._viewContainerRef
  );
}
```

##### `DomPortal`
You can create a `DomPortal` from any native DOM element. `DomPortal` allows you to take any arbitrary DOM content and render it somewhere else. `DomPortal` moves content _as is_, so elements with Angular features like bindings or directives may no longer update if moved via `DomPortal`.

Usage:
```html
<div #domPortalContent>Some content here</div>
```

```ts
readonly domPortalContent = viewChild<ElementRef<HTMLElement>>('domPortalContent');

ngAfterViewInit() {
  this.domPortal = new DomPortal(this.domPortalContent()!);
}
```


##### `CdkPortalOutlet`
Used to add a portal outlet to a template. `CdkPortalOutlet` *is* a `PortalOutlet`.

Usage:
```html
<!-- Attaches the `userSettingsPortal` from the previous example. -->
<ng-template [cdkPortalOutlet]="userSettingsPortal"></ng-template>
```
