import {Component, ViewEncapsulation} from '@angular/core';
import {MdProgressFab} from '../../components/progress-fab/progress-fab';
import {MdToolbar} from '../../components/toolbar/toolbar';
import {MdCard} from '../../components/card/card';

@Component({
  selector: 'progress-fab-demo',
  templateUrl: 'demo-app/progress-fab/progress-fab-demo.html',
  styleUrls: ['demo-app/progress-fab/progress-fab-demo.css'],
  directives: [MdProgressFab, MdToolbar, MdCard],
  encapsulation: ViewEncapsulation.None
})
export class ProgressFabDemo {

  fabProgressValue: number = 0;

  determinateHidden: boolean = false;
  determinateColor: string = 'primary';

  constructor() {

    setInterval(() => this.increaseFabProgress(), 200);
  }

  increaseFabProgress() {
    this.fabProgressValue += 7;

    if (this.fabProgressValue >= 100) {
      this.determinateColor = 'warn';
      this.determinateHidden = true;
    }
  }
}
