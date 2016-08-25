# md-collapse

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

import {MdCollapse} from 'md/collapse';

@Component({
    selector: "...",
    directives: [MdCollapse]
})

export class ... {
    
    ...
    
    private isCollapsed: boolean = false;

    ...

}
 ```

### Properties

  - `collapse` - (`?boolean=true`) - It show/hide the collapsible content through toggling.
