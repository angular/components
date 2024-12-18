import {Component, ViewEncapsulation} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatBadgeModule} from '@angular/material/badge';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-badge-scene',
  templateUrl: './badge-scene.html',
  styleUrls: ['./badge-scene.scss'],
  standalone: true,
  imports: [MatIconModule, MatBadgeModule]
})
export class BadgeScene {}
