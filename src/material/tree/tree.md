The `mat-tree` provides a Material Design styled tree that can be used to display hierarchical
data.

This tree builds on the foundation of the CDK tree and uses a similar interface for its
data source input and template, except that its element and attribute selectors will be prefixed
with `mat-` instead of `cdk-`.

There are two types of trees: flat and nested. The DOM structures are different for these
two types of trees.

#### Flat tree

In a flat tree, the hierarchy is flattened; nodes are not rendered inside of each other,
but instead are rendered as siblings in sequence.

```html
<mat-tree>
  <mat-tree-node> parent node </mat-tree-node>
  <mat-tree-node> -- child node1 </mat-tree-node>
  <mat-tree-node> -- child node2 </mat-tree-node>
</mat-tree>
```

<!-- example(tree-flat-child-accessor-overview) -->

Flat trees are generally easier to style and inspect. They are also more friendly to scrolling
variations, such as infinite or virtual scrolling.

#### Nested tree

In a nested tree, children nodes are placed inside their parent node in DOM. The parent node
contains a node outlet into which children are projected.

```html
<mat-tree>
   <mat-nested-tree-node>
     parent node
     <mat-nested-tree-node> -- child node1 </mat-nested-tree-node>
     <mat-nested-tree-node> -- child node2 </mat-nested-tree-node>
   </mat-nested-tree-node>
</mat-tree>
```

<!-- example(tree-nested-child-accessor-overview) -->

Nested trees are easier to work with when hierarchical relationships are visually represented in
ways that would be difficult to accomplish with flat nodes.

### Usage

#### Writing your tree template

In order to use the tree, you must define a tree node template. There are two types of tree nodes,
`<mat-tree-node>` for flat tree and `<mat-nested-tree-node>` for nested tree. The tree node
template defines the look of the tree node, expansion/collapsing control and the structure for
nested children nodes.

A node definition is specified via any element with `matNodeDef`. This directive exports the node
data to be used in any bindings in the node template.

```html
<mat-tree-node *matNodeDef="let node">
  {{node.key}}: {{node.value}}
</mat-tree-node>
```

##### Flat tree node template

Flat trees use the `level` of a node to both render and determine hierarchy of the nodes for screen
readers. This may be provided either via `levelAccessor`, or will be calculated by `MatTree` if
`childrenAccessor` is provided.

Spacing can be added either by applying the `matNodePadding` directive or by applying custom styles
based on the `aria-level` attribute.


##### Nested tree node template

When using nested tree nodes, the node template must contain a `matTreeNodeOutlet`, which marks
where the children of the node will be rendered.

```html
<mat-nested-tree-node *matNodeDef="let node">
  {{node.value}}
  <ng-container matTreeNodeOutlet></ng-container>
</mat-nested-tree-node>
```

#### Adding expand/collapse

The `matTreeNodeToggle` directive can be used to add expand/collapse functionality for tree nodes.
The toggle calls the expand/collapse functions in the `matTree` and is able to expand/collapse
a tree node recursively by setting `[matTreeNodeToggleRecursive]` to true.

`matTreeNodeToggle` should be attached to button elements, and will trigger upon click or keyboard
activation. For icon buttons, ensure that `aria-label` is provided.

```html
<mat-tree-node *matNodeDef="let node">
  <button matTreeNodeToggle aria-label="toggle tree node" [matTreeNodeToggleRecursive]="true">
    <mat-icon>expand</mat-icon>
  </button>
  {{node.value}}
</mat-tree-node>
```

### Toggle

A `matTreeNodeToggle` can be added in the tree node template to expand/collapse the tree node. The
toggle toggles the expand/collapse functions in `TreeControl` and is able to expand/collapse a
tree node recursively by setting `[matTreeNodeToggleRecursive]` to `true`.

The toggle can be placed anywhere in the tree node, and is only toggled by `click` action.


### Padding (Flat tree only)

The `matTreeNodePadding` can be placed in a flat tree's node template to display the `level`
information of a flat tree node.

```html
<mat-tree-node *matNodeDef="let node" matNodePadding>
  {{node.value}}
</mat-tree-node>
```

This is unnecessary for a nested tree, since the hierarchical structure of the DOM allows for
padding to be added via CSS.


#### Conditional template

The tree may include multiple node templates, where a template is chosen
for a particular data node via the `when` predicate of the template.

```html
<mat-tree-node *matNodeDef="let node" matTreeNodePadding>
  {{node.value}}
</mat-tree-node>
<mat-tree-node *matNodeDef="let node; when: isSpecial" matTreeNodePadding>
  [ A special node {{node.value}} ]
</mat-tree-node>
```

### Data Source

#### Connecting the tree to a data source

Similar to `mat-table`, you can provide data to the tree through a `DataSource`. When the tree receives
a `DataSource` it will call its `connect()` method which returns an observable that emits an array
of data. Whenever the data source emits data to this stream, the tree will render an update.

Because the data source provides this stream, it bears the responsibility of toggling tree
updates. This can be based on anything: tree node expansion change, websocket connections, user
interaction, model updates, time-based intervals, etc.

There are two main methods of providing data to the tree:

* flattened data, combined with `levelAccessor`. This should be used if the data source already
  flattens the nested data structure into a single array.
* only root data, combined with `childrenAccessor`. This should be used if the data source is
  already provided as a nested data structure.

#### `levelAccessor`

`levelAccessor` is a function that when provided a datum, returns the level the data sits at in the
tree structure. If `levelAccessor` is provided, the data provided by `dataSource` should contain all
renderable nodes in a single array.

The data source is responsible for handling node expand/collapse events and providing an updated
array of renderable nodes, if applicable. This can be listened to via the `(expansionChange)` event
on `mat-tree-node` and `mat-nested-tree-node`.

#### `childrenAccessor`

`childrenAccessor` is a function that when provided a datum, returns the children of that particular
datum. If `childrenAccessor` is provided, the data provided by `dataSource` should _only_ contain
the root nodes of the tree.

#### `trackBy`

To improve performance, a `trackBy` function can be provided to the tree similar to Angular’s
[`ngFor` `trackBy`](https://angular.dev/api/common/NgForOf?tab=usage-notes). This informs the
tree how to uniquely identify nodes to track how the data changes with each update.

```html
<mat-tree [dataSource]="dataSource" [treeControl]="treeControl" [trackBy]="trackByFn">
```

### Accessibility

The `<mat-tree>` implements the [`tree` widget](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/),
including keyboard navigation and appropriate roles and ARIA attributes.

In order to use the new accessibility features, migrating to `levelAccessor` and `childrenAccessor`
is required. Trees using `treeControl` do not implement the correct accessibility features for
backwards compatibility.

#### isExpandable

In order for the tree to correctly determine whether or not a node is expandable, the `isExpandable`
property must be set on all `mat-tree-node` or `mat-tree-nested-node` that are expandable.

#### Activation actions

For trees with nodes that have actions upon activation or click, `<mat-tree-node>` will emit
`(activation)` events that can be listened to when the user activates a node via keyboard
interaction.

```html
<mat-tree-node
    *matNodeDef="let node"
    (click)="performAction(node)"
    (activation)="performAction($event)">
</mat-tree-node>
```

In this example, `$event` contains the node's data and is equivalent to the implicit data passed in
the `matNodeDef` context.
