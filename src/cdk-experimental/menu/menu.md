**Warning: this component is still experimental. It may have bugs and the API may change at any
time**

# Menu

The CDK's `MenuModule` provides a set of directives which allow developers to build custom Menus and
MenuBars according the the [MenuBar design pattern](https://www.w3.org/TR/wai-aria-practices-1.1/#menu).

## Example

```html
<ul cdkMenuBar>
  <li role="none"><button id="file_button" [cdkMenuTriggerFor]="file">File</button></li>
  <li role="none"><button id="edit_button" [cdkMenuTriggerFor]="edit">Edit</button></li>
</ul>

<ng-template cdkMenuPanel #file="cdkMenuPanel">
  <ul cdkMenu id="file_menu">
    <li role="none"><button id="share_button" cdkMenuItem>Share</button></li>
    <li role="none"><button id="open_button" cdkMenuItem>Open</button></li>
    <li role="none"><button id="rename_button" cdkMenuItem>Rename</button></li>
    <li role="none"><button id="print_button" cdkMenuItem>Print</button></li>
  </ul>
</ng-template>

<ng-template cdkMenuPanel #edit="cdkMenuPanel">
  <ul cdkMenu id="edit_menu">
    <li role="none"><button id="undo_button" cdkMenuItem>Undo</button></li>
    <li role="none"><button id="redo_button" cdkMenuItem>Redo</button></li>
    <li role="none"><button id="cut_button" cdkMenuItem>Cut</button></li>
    <li role="none"><button id="copy_button" cdkMenuItem>Copy</button></li>
    <li role="none"><button id="paste_button" cdkMenuItem>Paste</button></li>
  </ul>
</ng-template>
```

## Directives

### cdkMenuBar

`cdkMenuBar` should be applied to one root MenuBar component which contains a set of `cdkMenuItem`
components. The directive should be applied to a unordered list component. Note that the component is
always visible and is the main interaction point for the user.

### cdkMenu

`cdkMenu` is applied to the sub-menu component(s) which should be opened by an associated `cdkMenuItem`.
`cdkMenu` components should not be nested and they should contain `cdkMenuItem` components or
`cdkMenuGroup` components.

### cdkMenuGroup

`cdkMenuGroup` is used to logically group `cdkMenuItem` components when used with MenuItems which are
a menuitemradio.

`cdkMenuItem` components marked as `menuitemradio` inside of a `cdkMenuGroup` can only have a single
active item and follow the RadioButton and RadioGroup standard pattern.

### cdkMenuItem

`cdkMenuItem` is applied to a component and performs one of the following actions based on the set role:

- If menuitem:
  - triggers a submenu, or
  - performs some developer provided action
- If menuitemcheckbox
  - can be toggled on/off and does not open a submenu
- If menuitemradio
  - connected to sibling menuitemradio buttons (group) and does not open a submenu

Further note that menuitemradio and menuitemcheckbox items may be grouped inside of either a `cdkMenu`
or `cdkMenuGroup` as both directives logically group their children.

### cdkMenuPanel

`cdkMenuPanel` is to be applied to an `ng-template` component. It is used to reference the component it wraps (should contain a single `cdkMenu`) and opens it in an overlay.
