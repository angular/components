# md-dialog

Native Angular2 Material Dialog component

## Installation
`npm install --save md-dialog`

### Selector

```html
<md-dialog></md-dialog>
```

## API

Example:
 
 ```html
<md-dialog #confirm>
	<md-dialog-title>Confirm Title</md-dialog-title>
	Body Content...
</md-dialog>
<button (click)="confirm.show()">Open Confirm Dialog</button>
 ```
 ```ts
//app-module.ts

import {MdDialogModule} from 'md-dialog/dialog';

@NgModule({
  imports: [
    MdDialogModule,
  ],
  declarations: [
    ...
  ]  
})

//component.ts

...

@Component({
    selector: "..."
})

export class ... {
    
    ...

}
 ```


### Properties

  - `[title]` _- string - (Default: `null`)(Optional)_ - The title of the dialog


### Open/Close Dialog
Use the component's `show()` and `close()` method to properly trigger the dialog's display. Reference the dialog using in your view to have access to the method to use.