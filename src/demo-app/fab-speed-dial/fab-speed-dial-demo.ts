import {Component} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'fab-speed-dial-demo',
  templateUrl: 'fab-speed-dial-demo.html',
  styleUrls: ['fab-speed-dial-demo.css'],
})
export class FabSpeedDialDemo {
  private _fixed: boolean = false;

  open: boolean = false;
  spin: boolean = false;
  direction: string = 'up';
  animationMode: string = 'fling';

  get fixed() { return this._fixed; }
  set fixed(fixed: boolean) {
    this._fixed = fixed;
    if (this._fixed) {
      this.open = true;
    }
  }

}
