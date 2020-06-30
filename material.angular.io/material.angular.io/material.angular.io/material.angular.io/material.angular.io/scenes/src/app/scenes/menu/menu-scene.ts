import {AfterViewInit, Component, NgModule, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule, MatMenuTrigger} from '@angular/material/menu';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-button-scene',
  templateUrl: './menu-scene.html',
  styleUrls: ['./menu-scene.scss']
})
export class MenuScene implements AfterViewInit {
  @ViewChild('menuTrigger') trigger: MatMenuTrigger;

  ngAfterViewInit() {
    this.trigger.openMenu();
  }
}

@NgModule({
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
  exports: [MenuScene],
  declarations: [MenuScene]
})
export class MenuSceneModule {
}

