import {Component, ViewEncapsulation} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatDividerModule} from '@angular/material/divider';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-divider-scene',
  templateUrl: './divider-scene.html',
  styleUrls: ['./divider-scene.scss'],
  standalone: true,
  imports: [MatListModule, MatIconModule, MatDividerModule]
})
export class DividerScene {}
