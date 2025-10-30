import {Component} from '@angular/core';
import {Toolbar, ToolbarWidget} from '@angular/aria/toolbar';
import {LiveAnnouncer} from '@angular/cdk/a11y';

/** @title Basic RTL Toolbar Example */
@Component({
  selector: 'toolbar-rtl-example',
  templateUrl: 'toolbar-rtl-example.html',
  styleUrl: '../toolbar-common.css',
  imports: [Toolbar, ToolbarWidget],
})
export class ToolbarRtlExample {
  constructor(private _liveAnnouncer: LiveAnnouncer) {}
  format(tool: string) {
    console.log(`Tool activated: ${tool}`);
    this._liveAnnouncer.announce(`${tool} applied`, 'polite');
  }
  test(action: string) {
    console.log(`Action triggered: ${action}`);
    this._liveAnnouncer.announce(`${action} button activated`, 'polite');
  }
}
