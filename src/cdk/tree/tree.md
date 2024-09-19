The `<cdk-tree>` enables developers to build a customized tree experience for structured data. The
`<cdk-tree>` provides a foundation to build other features such as filtering on top of tree.
For a Material Design styled tree, see `<mat-tree>` which builds on top of the `<cdk-tree>`.

There are two types of trees: flat and nested. The DOM structures are different for these
these two types of trees.

#### Flat tree

In a flat tree, the hierarchy is flattened; nodes are not rendered inside of each other, but instead
are rendered as siblings in sequence.

```html
<cdk-tree>
  <cdk-tree-node> parent node </cdk-tree-node>
  <cdk-tree-node> -- child node1 </cdk-tree-node>
  <cdk-tree-node> -- child node2 </cdk-tree-node>
</cdk-tree>

```

<!-- example(cdk-tree-flat-children-accessor) -->

Flat trees are generally easier to style and inspect. They are also more friendly to scrolling
variations, such as infinite or virtual scrolling.


#### Nested tree

In a nested tree, children nodes are placed inside their parent node in DOM. The parent node
contains a node outlet into which children are projected.

```html
<cdk-tree>
  <cdk-nested-tree-node>
    parent node
    <cdk-nested-tree-node> -- child node1 </cdk-nested-tree-node>
    <cdk-nested-tree-node> -- child node2 </cdk-nested-tree-node>
  </cdk-nested-tree-node>
</cdk-tree>
```

<!-- example(cdk-tree-nested-children-accessor) -->

Nested trees are easier to work with when hierarchical relationships are visually represented in
ways that would be difficult to accomplish with flat nodes.


### Usage

#### Writing your tree template

In order to use the tree, you must define a tree node template. There are two types of tree nodes,
`<cdk-tree-node>` for flat tree and `<cdk-nested-tree-node>` for nested tree. The tree node
template defines the look of the tree node, expansion/collapsing control and the structure for
nested children nodes.

A node definition is specified via any element with `cdkNodeDef`. This directive exports the node
data to be used in any bindings in the node template.

```html
<cdk-tree-node *cdkNodeDef="let node">
  {{node.key}}: {{node.value}}
</cdk-tree-node>
```

##### Flat tree node template

Flat trees use the `level` of a node to both render and determine hierarchy of the nodes for screen
readers. This may be provided either via `levelAccessor`, or will be calculated by `CdkTree` if
`childrenAccessor` is provided.

Spacing can be added either by applying the `cdkNodePadding` directive or by applying custom styles
based on the `aria-level` attribute.


##### Nested tree node template

When using nested tree nodes, the node template must contain a `cdkTreeNodeOutlet`, which marks
where the children of the node will be rendered.

```html
<cdk-nested-tree-node *cdkNodeDef="let node">
  {{node.value}}
  <ng-container cdkTreeNodeOutlet></ng-container>
</cdk-nested-tree-node>
```

#### Adding expand/collapse

The `cdkTreeNodeToggle` directive can be used to add expand/collapse functionality for tree nodes.
The toggle calls the expand/collapse functions in the `CdkTree` and is able to expand/collapse
a tree node recursively by setting `[cdkTreeNodeToggleRecursive]` to true.

`cdkTreeNodeToggle` should be attached to button elements, and will trigger upon click or keyboard
activation. For icon buttons, ensure that `aria-label` is provided.

```html
<cdk-tree-node *cdkNodeDef="let node">
  <button cdkTreeNodeToggle aria-label="toggle tree node" [cdkTreeNodeToggleRecursive]="true">
    <mat-icon>expand</mat-icon>
  </button>
  {{node.value}}
</cdk-tree-node>
```

#### Padding (Flat tree only)

The `cdkTreeNodePadding` directive can be placed in a flat tree's node template to display the level
information of a flat tree node.

```html
<cdk-tree-node *cdkNodeDef="let node" cdkNodePadding>
  {{node.value}}
</cdk-tree-node>
```

This is unnecessary for a nested tree, since the hierarchical structure of the DOM allows for
padding to be added via CSS.


#### Conditional template

The tree may include multiple node templates, where a template is chosen
for a particular data node via the `when` predicate of the template.

```html
<cdk-tree-node *cdkNodeDef="let node" cdkTreeNodePadding>
  {{node.value}}
</cdk-tree-node>
<cdk-tree-node *cdkNodeDef="let node; when: isSpecial" cdkTreeNodePadding>
  [ A special node {{node.value}} ]
</cdk-tree-node>
```

### Data Source

#### Connecting the tree to a data source

Similar to `cdk-table`, data is provided to the tree through a `DataSource`. When the tree receives
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
on `cdk-tree-node` and `cdk-nested-tree-node`.

#### `childrenAccessor`

`childrenAccessor` is a function that when provided a datum, returns the children of that particular
datum. If `childrenAccessor` is provided, the data provided by `dataSource` should _only_ contain
the root nodes of the tree.

#### `trackBy`

To improve performance, a `trackBy` function can be provided to the tree similar to Angular’s
[`ngFor` `trackBy`](https://angular.io/api/common/NgForOf#change-propagation). This informs the
tree how to uniquely identify nodes to track how the data changes with each update.

```html
<cdk-tree [dataSource]="dataSource" [treeControl]="treeControl" [trackBy]="trackByFn">
```

### Accessibility

The `<cdk-tree>` implements the [`tree` widget](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/),
including keyboard navigation and appropriate roles and ARIA attributes.

In order to use the new accessibility features, migrating to `levelAccessor` and `childrenAccessor`
is required. Trees using `treeControl` do not implement the correct accessibility features for
backwards compatibility.

#### isExpandable

In order for the tree to correctly determine whether or not a node is expandable, the `isExpandable`
property must be set on all `cdk-tree-node` or `cdk-tree-nested-node` that are expandable.

#### Activation actions

For trees with nodes that have actions upon activation or click, `<cdk-tree-node>` will emit
`(activation)` events that can be listened to when the user activates a node via keyboard
interaction.

```html
<cdk-tree-node
    *cdkNodeDef="let node"
    (click)="performAction(node)"
    (activation)="performAction($event)">
</cdk-tree-node>
```

In this example, `$event` contains the node's data and is equivalent to the implicit data passed in
the `cdkNodeDef` context.
