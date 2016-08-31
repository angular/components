import {Component} from '@angular/core';
import {Md2Toast} from '@angular2-material/toast/toast';

@Component({
  moduleId: module.id,
  selector: 'toast-demo',
  templateUrl: 'toast-demo.html'
})
export class ToastDemo {
  constructor(private toast: Md2Toast) { }
  toastMe() {
    this.toast.show('test message...');
  }
}
