import {Component, ViewEncapsulation} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-sidenav-scene',
  templateUrl: './sidenav-scene.html',
  styleUrls: ['./sidenav-scene.scss'],
  imports: [MatSidenavModule, MatListModule, MatIconModule],
})
export class SidenavScene {}
