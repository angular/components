import {Component, ViewEncapsulation} from '@angular/core';
import {MatCheckboxModule} from '@angular/material/checkbox';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-checkbox-scene',
  templateUrl: './checkbox-scene.html',
  styleUrls: ['./checkbox-scene.scss'],
  imports: [MatCheckboxModule],
})
export class CheckboxScene {}
