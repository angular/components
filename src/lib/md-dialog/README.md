# md2-dialog

Native Angular2 Material Dialog component

## Installation
`npm install --save md2-dialog`

### Selector

```html
<md2-dialog></md2-dialog>
```

## API

Example:
 
 ```html
<md2-dialog #confirm>
	<md2-dialog-title>Confirm Title</md2-dialog-title>
	Body Content...
</md2-dialog>
<button (click)="confirm.show()">Open Confirm Dialog</button>
 ```
 ```ts
//app-module.ts

import {Md2DialogModule} from 'md2-dialog/dialog';

@NgModule({
  imports: [
    Md2DialogModule,
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