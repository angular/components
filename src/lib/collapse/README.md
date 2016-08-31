# md2-collapse

Native Angular2 Material Collapse directive

## Installation
`npm install --save md2-collapse`

## API

Example:
 
HTML sample code
 ```html
<div [collapse]="isCollapsed">
  Lorum Ipsum Content
</div>
 ```

TS sample code
 ```ts
//app-module.ts

import {Md2CollapseModule} from 'md2-collapse/collapse';

@NgModule({
  imports: [
    Md2CollapseModule,
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
    
    private isCollapsed: boolean = false;

    ...

}
 ```

### Properties

  - `collapse` - (`?boolean=true`) - It show/hide the collapsible content through toggling.
