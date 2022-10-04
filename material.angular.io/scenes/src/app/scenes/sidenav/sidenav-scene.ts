import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatLegacyListModule as MatListModule} from '@angular/material/legacy-list';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-sidenav-scene',
  templateUrl: './sidenav-scene.html',
  styleUrls: ['./sidenav-scene.scss']
})
export class SidenavScene {
}

@NgModule({
  imports: [
    MatIconModule,
    MatSidenavModule,
    MatListModule
  ],
  exports: [SidenavScene],
  declarations: [SidenavScene]
})
export class SidenavSceneModule {}
