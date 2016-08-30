# md2-toast

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

import {Md2Toast} from 'md2/toast';

@Component({
    selector: "...",
    providers: [Md2Toast]
})

export class ... {
    
    ...
    
    toastMe() {
      this.toast.show('Toast message...');

      ---  or  ---

      this.toast.show({ message: 'Toast message...', hideDelay: 1000 });
    }

    ...

}
 ```
