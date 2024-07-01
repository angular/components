import {Component} from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';

/**
 * @title Toolbar with just text
 */
@Component({
  selector: 'toolbar-simple-example',
  templateUrl: 'toolbar-simple-example.html',
  standalone: true,
  imports: [MatToolbarModule],
})
export class ToolbarSimpleExample {}
