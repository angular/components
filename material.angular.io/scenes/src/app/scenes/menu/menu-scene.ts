import {AfterViewInit, Component, NgModule, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyMenuModule as MatMenuModule, MatLegacyMenuTrigger as MatMenuTrigger} from '@angular/material/legacy-menu';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-button-scene',
  templateUrl: './menu-scene.html',
  styleUrls: ['./menu-scene.scss']
})
export class MenuScene implements AfterViewInit {
  @ViewChild('menuTrigger') trigger!: MatMenuTrigger;

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

