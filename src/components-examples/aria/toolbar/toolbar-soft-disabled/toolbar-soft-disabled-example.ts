import {Component} from '@angular/core';
import {Toolbar, ToolbarWidget} from '@angular/aria/toolbar';
import {LiveAnnouncer} from '@angular/cdk/a11y';

/** @title Soft Disabled Toolbar Example */
@Component({
  selector: 'toolbar-soft-disabled-example',
  templateUrl: 'toolbar-soft-disabled-example.html',
  styleUrl: '../toolbar-common.css',
  imports: [Toolbar, ToolbarWidget],
})
export class ToolbarSoftDisabledExample {
  constructor(private _liveAnnouncer: LiveAnnouncer) {}

  // Control for which radio options are individually disabled
  disabledOptions: string[] = ['center'];

  format(tool: string) {
    console.log(`Tool activated: ${tool}`);
    this._liveAnnouncer.announce(`${tool} applied`, 'polite');
  }
  test(action: string) {
    console.log(`Action triggered: ${action}`);
    this._liveAnnouncer.announce(`${action} button activated`, 'polite');
  }
}
