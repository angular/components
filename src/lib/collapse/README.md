# md-collapse

Native Angular2 Material Collapse directive

## Installation
`npm install --save md-collapse`

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

import {MdCollapseModule} from 'md-collapse/collapse';

@NgModule({
  imports: [
    MdCollapseModule,
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
