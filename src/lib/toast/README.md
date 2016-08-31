# md2-toast

Native Angular2 Material Toast service

## Installation
`npm install --save md2-toast`

## API

Example:
 
 ```ts
//app-module.ts

import {Md2ToastModule} from 'md2-toast/toast';

@NgModule({
  imports: [
    Md2ToastModule,
  ],
  declarations: [
    ...
  ]  
})

//component.ts

...

import {Md2Toast} from 'md2/toast';

@Component({
    selector: "..."
})

export class ... {
    
    ...
    constructor(private toast: Md2Toast) { }
    toastMe() {
      this.toast.show('Toast message...');

      ---  or  ---

      this.toast.show({ message: 'Toast message...', hideDelay: 1000 });
    }

    ...

}
 ```
