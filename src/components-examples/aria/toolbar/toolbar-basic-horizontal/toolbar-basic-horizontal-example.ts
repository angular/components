import {Component} from '@angular/core';
import {Toolbar, ToolbarWidget} from '@angular/aria/toolbar';
import {RadioGroup, RadioButton} from '@angular/aria/radio-group';
import {LiveAnnouncer} from '@angular/cdk/a11y';

/** @title Basic Horizontal Toolbar Example */
@Component({
  selector: 'toolbar-basic-horizontal-example',
  templateUrl: 'toolbar-basic-horizontal-example.html',
  styleUrl: '../toolbar-common.css',
  imports: [RadioButton, RadioGroup, Toolbar, ToolbarWidget],
})
export class ToolbarBasicHorizontalExample {
  constructor(private _liveAnnouncer: LiveAnnouncer) {}
  alignments = [
    {value: 'left', label: 'Left'},
    {value: 'center', label: 'Center'},
    {value: 'right', label: 'Right'},
  ];
  format(tool: string) {
    console.log(`Tool activated: ${tool}`);
    this._liveAnnouncer.announce(`${tool} applied`, 'polite');
  }
  test(action: string) {
    console.log(`Action triggered: ${action}`);
    this._liveAnnouncer.announce(`${action} button activated`, 'polite');
  }
}
