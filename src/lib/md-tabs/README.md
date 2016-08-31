# md2-tabs

Native Angular2 Material Tabs component

## Installation
`npm install --save md2-tabs`

## API

Example:
 
 ```html
<md2-tabs selectedIndex="0">
  <md2-tab label="title1">Test content 1</md2-tab>
  <md2-tab label="title2">Test content 2</md2-tab>
  <md2-tab>
    <template md2-tab-label>Test content 3</template>
    Test content 3
  </md2-tab>
</md2-tabs>
 ```
 ```ts
//app-module.ts

import {Md2TabsModule} from 'md2-tabs/tabs';

@NgModule({
  imports: [
    Md2TabsModule,
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

### Properties of md2-tabs

  - `selectedIndex` (`?number=0`) - Index of the active/selected tab.
  - `class` (`?string=''`) - To set custom class on `md2-tabs` element.

### Properties of md2-tab

  - `label` (`?string=''`) - Optional attribute to specify a simple string as the tab label.
  - `active` (`?boolean='false'`) - To set as an active a tab.
  - `disabled` (`?boolean='false'`) - To set as an disabled a tab.
  - `class` (`?string=''`) - To set custom class on `md2-tab` element.

### Events

  - `change` - it fires after a tab has been changes; returns object of selected tab.
