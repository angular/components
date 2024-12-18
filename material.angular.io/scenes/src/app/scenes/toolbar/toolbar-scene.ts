import {Component, ViewEncapsulation} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-toolbar-scene',
  templateUrl: './toolbar-scene.html',
  styleUrls: ['./toolbar-scene.scss'],
  standalone: true,
  imports: [MatToolbarModule, MatIconModule]
})
export class ToolbarScene {}
