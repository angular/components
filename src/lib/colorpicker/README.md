# md2-colorpicker

Native Angular2 Material Colorpicker directive

## API

Example:
 
 ```html
//HTML

<md2-colorpicker [(ngModel)]="color" 
                position="bottom" 
                (change)="change($event)">
</md2-colorpicker>

 ```
 ```ts
//app-module.ts

import {Md2ColorpickerModule} from 'md2-colorpicker/colorpicker';

@NgModule({
  imports: [
    Md2ColorpickerModule,
  ],
  declarations: [
    ...
  ]  
})

//component.ts
...

@Component({
  selector: "...",
  templateUrl: 'component.html'
})

export class ... {
    
    ...
    
    private color: string = "#123456";

    private change(value) { 
      ...
    }

    ...

}
 ```


### Properties

  - `[(ngModel)]` - string - (Default: `#000`)- Two way data binding - It would be 'value' of color.
  - `[position]` _- string - (Default: `bottom`)(Optional)_ - position of colorpicker dialog, supported positions: 'right', 'left', 'top', 'bottom'.  
  - `[format]` _- string - (Default: `hex`)(Optional)_ - color format, supported formats: 'hex', 'rgba', 'hsla'.