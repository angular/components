import {Component, ViewEncapsulation} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-icon-scene',
  templateUrl: './icon-scene.html',
  styleUrls: ['./icon-scene.scss'],
  standalone: true,
  imports: [MatIconModule]
})
export class IconScene {}
