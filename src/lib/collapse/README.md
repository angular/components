# md2-collapse

Native Angular2 Material Collapse directive

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

...

import {Md2Collapse} from 'md2/collapse';

@Component({
    selector: "...",
    directives: [Md2Collapse]
})

export class ... {
    
    ...
    
    private isCollapsed: boolean = false;

    ...

}
 ```

### Properties

  - `collapse` - (`?boolean=true`) - It show/hide the collapsible content through toggling.
