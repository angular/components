# md2-accordion

Native Angular2 Material Accordion component

## Installation
`npm install --save md2-accordion`

## API

Example:
 
HTML sample code
 ```html
<md2-accordion [multiple]="multiple">
  <md2-accordion-tab *ngFor="let tab of accordions" 
                     [header]="tab.title" 
                     [active]="tab.active" 
                     [disabled]="tab.disabled">
    {{tab.content}}
  </md2-accordion-tab>
</md2-accordion>
 ```

TS sample code
 ```ts
//app-module.ts

import {Md2AccordionModule} from 'md2-accordion/accordion';

@NgModule({
  imports: [
    Md2AccordionModule,
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
   
    private accordions: Array<any> = [
      { title: 'Dynamic Title 1', content: 'Dynamic content 1' },
      { title: 'Dynamic Title 2', content: 'Dynamic content 2', disabled: true },
      { title: 'Dynamic Title 3', content: 'Dynamic content 3', active: true }
    ];
    multiple: boolean = false;

    ...

}
 ```

### Properties of md2-accordion

  - `multiple` - (`?boolean=false`) - Control whether expanding an item will cause the other items to close.
  - `class` (`?string=''`) - To set custom class on `md2-accordion` element.

### Properties of md2-accordion-tab

  - `header` - (`?string=''`) - The clickable text on the tab's header. You need one to be able to click on the header for toggling.
  - `disabled` (`?boolean=false`) - Whether the accordion tab is disabled or not.
  - `active` (`?boolean=false`) - Whether accordion tab is open or closed.
  - `class` (`?string=''`) - To set custom class on `md2-accordion-tab` element.

### Events

  - `open` - It fires after a open tab.
  - `close` - It fires after a close tab.

