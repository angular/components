# md2-select

Native Angular2 Material Select component

## Installation
`npm install --save md2-select`

## API

Example:
 
 ```html
<md2-select [(ngModel)]="item" (change)="change($event)" [disabled]="disabled">
  <md2-option *ngFor="let i of items" [value]="i.value" [disabled]="i.disabled">{{i.name}}</md2-option>
</md2-select>
 ```
 ```ts
//app-module.ts

import {Md2SelectModule} from 'md2-select/select';

@NgModule({
  imports: [
    Md2SelectModule,
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
    
  private disabled: boolean = false;

  private items: Array<any> =
    [
      { name: 'Amsterdam', value: '1', disabled: false },
      { name: 'Birmingham', value: '2', disabled: false },
      { name: 'Dortmund', value: '3', disabled: false },
      { name: 'Gothenburg', value: '4', disabled: true },
      { name: 'London', value: '5', disabled: false },
      { name: 'Seville', value: '6', disabled: false }
    ];

  private item: string = '3';

  private change(value: any) {
    console.log('Selected value is: ', value);
  }

  ...

}
 ```

### Properties

  - `ngModel` (`any`) - two way data binding. This should be a value of selected option. This option is mutually exclusive with value.
  - `placeholder` (`?string=''`) - Placeholder text to display when the element has no selected item.
  - `disabled` (`?boolean=false`) - When `true`, it specifies that the component should be disabled or if apply on option then the specific option should be disabled.
  - `value` - (`any`) - Items that have children of select element it pass any object or string over there, while select the specific option emit value of it.

### Events

  - `change` - it fires after a new option selected; returns `value` of selected option.