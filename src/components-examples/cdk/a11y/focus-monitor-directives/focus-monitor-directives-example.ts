import {FocusOrigin} from '@angular/cdk/a11y';
import {Component} from '@angular/core';

/** @title Monitoring focus with FocusMonitor */
@Component({
  selector: 'focus-monitor-directives-example',
  templateUrl: 'focus-monitor-directives-example.html',
  styleUrls: ['focus-monitor-directives-example.css']
})
export class FocusMonitorDirectivesExample {
  elementOrigin = this.formatOrigin(null);
  subtreeOrigin = this.formatOrigin(null);

  formatOrigin(origin: FocusOrigin): string {
    return origin ? origin + ' focused' : 'blurred';
  }
}
