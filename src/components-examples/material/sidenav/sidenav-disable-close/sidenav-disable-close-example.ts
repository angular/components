import {Component, signal, viewChild} from '@angular/core';
import {MatSidenav, MatSidenavModule} from '@angular/material/sidenav';
import {MatButtonModule} from '@angular/material/button';

/** @title Sidenav with custom escape and backdrop click behavior */
@Component({
  selector: 'sidenav-disable-close-example',
  templateUrl: 'sidenav-disable-close-example.html',
  styleUrl: 'sidenav-disable-close-example.css',
  imports: [MatSidenavModule, MatButtonModule],
})
export class SidenavDisableCloseExample {
  sidenav = viewChild.required<MatSidenav>('sidenav');

  reason = signal('');

  close(reason: string) {
    this.reason.set(reason);
    this.sidenav().close();
  }

  shouldRun = /(^|.)(stackblitz|webcontainer).(io|com)$/.test(window.location.host);
}
