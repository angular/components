# md-toast

Native Angular2 Material Toast service

## Installation
`npm install --save md-toast`

## API

Example:
 
 ```ts
//app-module.ts

import {MdToastModule} from 'md-toast/toast';

@NgModule({
  imports: [
    MdToastModule,
  ],
  declarations: [
    ...
  ]  
})

//component.ts

...

import {MdToast} from 'md/toast';

@Component({
    selector: "..."
})

export class ... {
    
    ...
    constructor(private toast: MdToast) { }
    toastMe() {
      this.toast.show('Toast message...');

      ---  or  ---

      this.toast.show({ message: 'Toast message...', hideDelay: 1000 });
    }

    ...

}
 ```
