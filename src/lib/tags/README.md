# md2-tags

Native Angular2 Material Tags component

## API

Example:
 
 ```html
<md2-tags [md-tags]="tags"
          md-tag-text="name"
          md-tag-value="value"
          [(ngModel)]="tag"
          (change)="change($event)"
          placeholder="+Tag">
</md2-tags>
 ```
 ```ts

...

import {Md2Tags} from 'md2/tags';

@Component({
  selector: "...",
  directives: [Md2Tags]
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

  - `md-tags` - (`Array<any>`) - Array of items for suggestion list.
  - `ngModel` (`?Array<any>`) - two way data binding. This should be an array with single string or object.
  - `placeholder` (`?string=''`) - Placeholder text to display hint text.
  - `disabled` (`?boolean=false`) - When `true`, it specifies that the component should be disabled.
  - `md-tag-text` (`?string=''`) - Map items array with object to display 'text' property with the array.
  - `md-tag-value` (`?string=''`) - Map items array with object to return 'value' and update 'ngModel' object with the value property, if `md-tag-value` is `null` then it return 'value' as whole object of selected item from list.

### Events

  - `change` - it fires after a new item selected; return `value`.