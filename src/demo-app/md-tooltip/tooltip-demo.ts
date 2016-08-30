import {Component} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'tooltip-demo',
  templateUrl: 'tooltip-demo.html'
})
export class TooltipDemo {
  private dynamicTooltip: string = 'Hello, World!';
  private dynamicTooltipText: string = 'dynamic';
  private htmlTooltip: string = 'I\'ve been made <b>bold</b>!';
}
