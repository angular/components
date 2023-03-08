import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatBadgeModule} from '@angular/material/badge';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-badge-scene',
  templateUrl: './badge-scene.html',
  styleUrls: ['./badge-scene.scss']
})
export class BadgeScene {
}

@NgModule({
  imports: [
    MatIconModule,
    MatBadgeModule
  ],
  exports: [BadgeScene],
  declarations: [BadgeScene]
})
export class BadgeSceneModule {}

