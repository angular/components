import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';

/**
 * @title Testing with MatToolbarHarness
 */
@Component({
  selector: 'toolbar-harness-example',
  templateUrl: 'toolbar-harness-example.html',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule],
})
export class ToolbarHarnessExample {}
