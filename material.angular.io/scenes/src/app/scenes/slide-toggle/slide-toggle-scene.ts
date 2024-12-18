import {Component, ViewEncapsulation} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';


@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-slide-toggle-scene',
  templateUrl: './slide-toggle-scene.html',
  styleUrls: ['./slide-toggle-scene.scss'],
  standalone: true,
  imports: [MatIconModule, MatSlideToggleModule]
})
export class SlideToggleScene {}
