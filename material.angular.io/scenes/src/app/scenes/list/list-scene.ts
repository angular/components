import {Component, ViewEncapsulation} from '@angular/core';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-list-scene',
  templateUrl: './list-scene.html',
  styleUrls: ['./list-scene.scss'],
  standalone: true,
  imports: [MatListModule, MatIconModule]
})
export class ListScene {}
