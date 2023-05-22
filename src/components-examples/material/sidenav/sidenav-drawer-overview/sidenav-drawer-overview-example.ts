import {Component} from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';

/** @title Basic drawer */
@Component({
  selector: 'sidenav-drawer-overview-example',
  templateUrl: 'sidenav-drawer-overview-example.html',
  styleUrls: ['sidenav-drawer-overview-example.css'],
  standalone: true,
  imports: [MatSidenavModule],
})
export class SidenavDrawerOverviewExample {}
