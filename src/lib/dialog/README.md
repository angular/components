# MdDialog

MdDialog is a service, which opens dialogs components in the view. 

### Methods

| Name |  Description |
| --- | --- |
| `open(component: ComponentType<T>, config: MdDialogConfig): MdDialogRef<T>` | Creates and opens a dialog matching material spec. |

### Config

| Key |  Description |
| --- | --- |
| `viewContainerRef: ViewContainerRef` | The view container ref to attach the dialog to. |
| `role: DialogRole = 'dialog'` | The ARIA role of the dialog element. Possible values are `dialog` and `alertdialog`|

## MdDialogRef

A reference to the dialog created by the MdDialog `open` method.

### Methods

| Name |  Description |
| --- | --- |
| `close(dialogResult?: any)` | Closes the dialog, pushing a value to the afterClosed observable. |
| `afterClosed(): Observable<any>` | Returns an observable which will emit the dialog result, passed to the `close` method above. |
