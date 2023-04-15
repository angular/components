import {AfterViewInit, Component, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule, MatMenuTrigger} from '@angular/material/menu';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-button-scene',
  templateUrl: './menu-scene.html',
  styleUrls: ['./menu-scene.scss'],
  standalone: true,
  imports: [MatButtonModule, MatMenuModule, MatIconModule]
})
export class MenuScene implements AfterViewInit {
  @ViewChild('menuTrigger') trigger!: MatMenuTrigger;

  ngAfterViewInit() {
    this.trigger.openMenu();
  }
}
