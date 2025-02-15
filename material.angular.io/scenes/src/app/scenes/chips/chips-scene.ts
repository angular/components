import {Component, ViewEncapsulation} from '@angular/core';
import {MatChipsModule} from '@angular/material/chips';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-chips-scene',
  templateUrl: './chips-scene.html',
  styleUrls: ['./chips-scene.scss'],
  imports: [MatChipsModule],
})
export class ChipsScene {}
