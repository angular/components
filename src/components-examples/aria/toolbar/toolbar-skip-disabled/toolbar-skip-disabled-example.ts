import {Component} from '@angular/core';
import {Toolbar, ToolbarWidget} from '@angular/aria/toolbar';
import {RadioGroup, RadioButton} from '@angular/aria/radio-group';
import {LiveAnnouncer} from '@angular/cdk/a11y';

/** @title Skip Disabled Toolbar Example */
@Component({
  selector: 'toolbar-skip-disabled-example',
  templateUrl: 'toolbar-skip-disabled-example.html',
  styleUrl: '../toolbar-common.css',
  imports: [RadioButton, RadioGroup, Toolbar, ToolbarWidget],
})
export class ToolbarSkipDisabledExample {
  constructor(private _liveAnnouncer: LiveAnnouncer) {}
  alignments = [
    {value: 'left', label: 'Left'},
    {value: 'center', label: 'Center'},
    {value: 'right', label: 'Right'},
  ];

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
