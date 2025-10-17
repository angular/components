import {Component} from '@angular/core';
import {Toolbar, ToolbarWidget} from '@angular/aria/toolbar';

/** @title Basic Horizontal Toolbar Example */
@Component({
  selector: 'toolbar-basic-horizontal-example',
  templateUrl: 'toolbar-basic-horizontal-example.html',
  styleUrl: '../toolbar-common.css',
  imports: [Toolbar, ToolbarWidget],
})
export class ToolbarBasicHorizontalExample {
  format(tool: string) {
    console.log(`Tool activated: ${tool}`);
  }
}
