# md-multiselect

Native Angular2 Material Multiselect component

## Installation
`npm install --save md-multiselect`

## API

Example:
 
 ```html
<md-multiselect [items]="items"
                 item-text="name"
                 item-value="value"
                 [(ngModel)]="item"
                 (change)="selected($event)"
                 placeholder="Placeholder Text">
</md-multiselect>
 ```
 ```ts
//app-module.ts

import {MdMultiselectModule} from 'md-multiselect/multiselect';

@NgModule({
  imports: [
    MdMultiselectModule,
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
    
    private items: Array<any> =
        [
            { name: 'Amsterdam', value: '1' },
            { name: 'Birmingham', value: '2' },
            { name: 'Dortmund', value: '3' },
            { name: 'Gothenburg', value: '4' },
            { name: 'London', value: '5' },
            { name: 'Seville', value: '6' }
        ];

    private item: Array<string> = ['3', '4'];

    private selected(value: any) {
        console.log('Selected value is: ', value);
    }

    ...

}
 ```

### Properties

  - `items` - (`Array<any>`) - Array of items from which to select. Should be an array of objects with `value` and `text` properties.
  As convenience, you may also pass an array of strings, in which case the same string is used for both the VALUE and the text.
  Items may be nested by adding a `children` property to any item, whose value should be another array of items. Items that have children may omit having an ID.
  If `items` are specified, all items are expected to be available locally and all selection operations operate on this local array only.
  If omitted, items are not available locally, and the `query` option should be provided to fetch data.
  - `ngModel` (`?Array<any>`) - two way data binding. This should be an array with single string or object of `value` and `text` properties in the case of input type 'Single',
  or an array of such objects otherwise. This option is mutually exclusive with value.
  - `placeholder` (`?string=''`) - Placeholder text to display when the element has no focus and selected items.
  - `disabled` (`?boolean=false`) - When `true`, it specifies that the component should be disabled.
  - `item-text` (`?string='text'`) - When items array is different with object properties then map 'text' property with the array.
  - `item-value` (`?string=''`) - Map items array with object to return 'value' and update 'ngModel' object with the value property, if `item-value` is `null` then it return 'value' as whole object of selected items from list.

### Events

  - `change` - it fires after a new option selected; returns object with `value` and `text` properties that describes a new option.
