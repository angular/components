import {AfterViewInit, Component, ViewEncapsulation, viewChild} from '@angular/core';
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
  readonly trigger = viewChild.required<MatMenuTrigger>('menuTrigger');

  ngAfterViewInit() {
    this.trigger().openMenu();
  }
}
