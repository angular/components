import {Component, ViewEncapsulation} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-core-scene',
  templateUrl: './core-scene.html',
  styleUrls: ['./core-scene.scss'],
  standalone: true,
  imports: [MatIconModule]
})
export class CoreScene {}
