# md2-tooltip

Native Angular2 Material Tooltip directive

## Installation
`npm install --save md2-tooltip`

## API

Example:
 
 ```html
<span tooltip-direction="left" tooltip="On the Left!">Left</span> <br />
<span tooltip-direction="right" tooltip="On the Right!">Right</span> <br />
<span tooltip-direction="bottom" tooltip="On the Bottom!">Bottom</span> <br />
<span tooltip-direction="top" tooltip="On the Top!">Top</span> <br />
<span tooltip-delay='1000' tooltip='appears with delay'>Delayed 1 Second</span>
 ```
 ```ts
//app-module.ts

import {Md2TooltipModule} from 'md2-tooltip/tooltip';

@NgModule({
  imports: [
    Md2TooltipModule,
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

  - `tooltip` (`string`) - text of tooltip.
  - `tooltip-direction` (`?string='bottom'`) - tooltip direction instruction, supported positions: 'top', 'bottom', 'left', 'right'.
  - `tooltip-delay` (`?numer=0`) - time in milliseconds before tooltip occurs.
