# md2-tags

Native Angular2 Material Tags component

## Installation
`npm install --save md2-tags`

## API

Example:
 
 ```html
<md2-tags [md2-tags]="tags"
          md2-tag-text="name"
          md2-tag-value="value"
          [(ngModel)]="tag"
          (change)="change($event)"
          placeholder="+Tag">
</md2-tags>
 ```
 ```ts
//app-module.ts

import {Md2TagsModule} from 'md2-tags/tags';

@NgModule({
  imports: [
    Md2TagsModule,
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

  private tags: Array<any> =
  [
    { name: 'Amsterdam', value: '1' },
    { name: 'Birmingham', value: '2' },
    { name: 'Dortmund', value: '3' },
    { name: 'Gothenburg', value: '4' },
    { name: 'London', value: '5' },
    { name: 'Seville', value: '6' }
  ];
  private tag: Array<any> = [
    { name: 'Dortmund', value: '3' },
    { name: 'Gothenburg', value: '4' }
  ];

  private change(value: any) {
    ...
  }

  ...

}
 ```

### Properties

  - `md2-tags` - (`Array<any>`) - Array of items for suggestion list.
  - `ngModel` (`?Array<any>`) - two way data binding. This should be an array with single string or object.
  - `placeholder` (`?string=''`) - Placeholder text to display hint text.
  - `disabled` (`?boolean=false`) - When `true`, it specifies that the component should be disabled.
  - `md2-tag-text` (`?string=''`) - Map items array with object to display 'text' property with the array.
  - `md2-tag-value` (`?string=''`) - Map items array with object to return 'value' and update 'ngModel' object with the value property, if `md2-tag-value` is `null` then it return 'value' as whole object of selected item from list.

### Events

  - `change` - it fires after a new item selected; return `value`.