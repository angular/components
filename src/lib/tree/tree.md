The `mat-tree` provides a Material Design styled tree that can be used to display hierarchy
data.

This tree builds on the foundation of the CDK tree and uses a similar interface for its
data source input and template, except that its element and attribute selectors will be prefixed 
with `mat-` instead of `cdk-`.

### Features

The `<mat-tree>` itself only deals with the rendering of a tree structure.
Additional features can be built on top of the tree by adding behavior inside node templates
(e.g., padding and trigger). Interactions that affect the
rendered data (such as expand/collapse) should be propagated through the table's data source.

### TreeControl

The `TreeControl` expand/collapse of the tree node. Users can expand/collapse a tree node
recursively through tree control. For nested tree node, `getChildren` function need to pass to 
the `NestedTreeControl` to make it work recursively. For flattened tree node, `getLevel` and 
`isExpandable` functions need to pass to the `FlatTreeControl` to make it work recursively.
 
### Trigger

A `matTreeNodeTrigger` can be added in the tree node template to expand/collapse the tree node. The
trigger triggers the expand/collapse functions in `TreeControl` and is able to expand/collapse a 
tree node recursively by setting `[matTreeNodeTriggerRecursive]` to `true`. 

The trigger can be placed anywhere in the tree node, and is only triggered by `click` action. 

The trigger is also work with both flat tree and nested tree.

### Padding

The `matTreeNodePadding` can be placed in a flat tree's node template to display the `level` 
information of a flat tree node.

### Simple Tree

In the near future, we will provide a simplified version of the tree with an easy-to-use
interface, material styling, and json input.

### Accessibility
Trees without text or labels should be given a meaningful label via `aria-label` or
`aria-labelledby`. The `aria-readonly` defaults to `true` if it's not set.

Tree's role is `tree`.
Node's default role is `treeitem`, and it will be changed to `group` if it has descendant nodes.

`mat-tree` does not manage any focus/keyboard interaction on its own. Users can add desired
focus/keyboard interactions in their application.
