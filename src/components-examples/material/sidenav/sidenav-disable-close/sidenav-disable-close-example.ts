import {Component, ViewChild} from '@angular/core';
import {MatSidenav, MatSidenavModule} from '@angular/material/sidenav';
import {MatButtonModule} from '@angular/material/button';
import {NgIf} from '@angular/common';

/** @title Sidenav with custom escape and backdrop click behavior */
@Component({
  selector: 'sidenav-disable-close-example',
  templateUrl: 'sidenav-disable-close-example.html',
  styleUrls: ['sidenav-disable-close-example.css'],
  standalone: true,
  imports: [NgIf, MatSidenavModule, MatButtonModule],
})
export class SidenavDisableCloseExample {
  @ViewChild('sidenav') sidenav: MatSidenav;

  reason = '';

  close(reason: string) {
    this.reason = reason;
    this.sidenav.close();
  }

  shouldRun = /(^|.)(stackblitz|webcontainer).(io|com)$/.test(window.location.host);
}
