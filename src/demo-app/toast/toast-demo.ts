import {Component} from '@angular/core';
import {MdToast} from '@angular2-material/toast/toast';

@Component({
  moduleId: module.id,
  selector: 'toast-demo',
  templateUrl: 'toast-demo.html'
})
export class ToastDemo {
  constructor(private toast: MdToast) { }
  toastMe() {
    this.toast.show('test message...');
  }
}
