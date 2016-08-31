import {
  Component,
  Inject,
  Optional,
  ViewEncapsulation
} from '@angular/core';
import { Toast } from './toast';

@Component({
  selector: 'md-toast',
  template: `
    <div class="md-toast-wrapper">
      <div *ngFor="let toast of toasts" class="md-toast" (click)="remove(toast.id)">
        <div class="md-toast-message">{{toast.message}}</div>
      </div>
    </div>
  `,
  styles: [`
    .md-toast-wrapper { position: fixed; top: 0; right: 0; z-index: 1060; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; cursor: default; overflow: hidden; min-width: 304px; padding: 8px; -moz-transition: all .4s cubic-bezier(.25,.8,.25,1); -o-transition: all .4s cubic-bezier(.25,.8,.25,1); -webkit-transition: all .4s cubic-bezier(.25,.8,.25,1); transition: all .4s cubic-bezier(.25,.8,.25,1); -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }
    .md-toast { position: relative; padding: 14px 24px; margin-bottom: 5px; display: block; background-color: #323232; color: #fafafa; box-shadow: 0 2px 5px 0 rgba(0,0,0,.26); border-radius: 2px; font-size: 14px; overflow: hidden; -ms-word-wrap: break-word; word-wrap: break-word; -moz-transition: all .4s cubic-bezier(.25,.8,.25,1); -o-transition: all .4s cubic-bezier(.25,.8,.25,1); -webkit-transition: all .4s cubic-bezier(.25,.8,.25,1); transition: all .4s cubic-bezier(.25,.8,.25,1); }
    .md-toast-message { display: block; }
  `],
  encapsulation: ViewEncapsulation.None,
})
export class MdToastComponent {
  toasts: Toast[] = [];
  maxShown = 5;

  /**
   * add toast
   * @param toast toast object with all parameters
   */
  add(toast: Toast) {
    this.toasts.push(toast);
    if (this.toasts.length > this.maxShown) {
      this.toasts.splice(0, (this.toasts.length - this.maxShown));
    }
  }

  /**
   * remove toast
   * @param toastId number of toast id
   */
  remove(toastId: number) {
    this.toasts = this.toasts.filter((toast) => { return toast.id !== toastId; });
  }

  /**
   * check toast
   */
  isToast(): boolean { return this.toasts.length > 0; }

}
