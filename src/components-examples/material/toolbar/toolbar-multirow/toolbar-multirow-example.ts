import {Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';

/**
 * @title Multi-row toolbar
 */
@Component({
  selector: 'toolbar-multirow-example',
  templateUrl: 'toolbar-multirow-example.html',
  styleUrls: ['toolbar-multirow-example.css'],
  standalone: true,
  imports: [MatToolbarModule, MatIconModule],
})
export class ToolbarMultirowExample {}
