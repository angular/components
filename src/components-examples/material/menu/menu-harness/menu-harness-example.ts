import {Component} from '@angular/core';
import {MatMenuModule} from '@angular/material/menu';

/**
 * @title Testing with MatMenuHarness
 */
@Component({
  selector: 'menu-harness-example',
  templateUrl: 'menu-harness-example.html',
  standalone: true,
  imports: [MatMenuModule],
})
export class MenuHarnessExample {}
