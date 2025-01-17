import {Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';

/**
 * @title Multi-row toolbar
 */
@Component({
  selector: 'toolbar-multirow-example',
  templateUrl: 'toolbar-multirow-example.html',
  styleUrl: 'toolbar-multirow-example.css',
  imports: [MatToolbarModule, MatIconModule],
})
export class ToolbarMultirowExample {}
