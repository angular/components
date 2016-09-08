import {Component} from '@angular/core';
import {MatLiveAnnouncer} from '@angular2-material/core';

@Component({
  moduleId: module.id,
  selector: 'toolbar-demo',
  templateUrl: 'live-announcer-demo.html',
})
export class LiveAnnouncerDemo {

  constructor(private live: MatLiveAnnouncer) {}

  announceText(message: string) {
    this.live.announce(message);
  }

}
