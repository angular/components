import {FocusMonitor, FocusOrigin} from '@angular/cdk/a11y';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild
} from '@angular/core';

/** @title Focusing with a specific FocusOrigin */
@Component({
  selector: 'focus-monitor-focus-via-example',
  templateUrl: 'focus-monitor-focus-via-example.html',
  styleUrls: ['focus-monitor-focus-via-example.css']
})
export class FocusMonitorFocusViaExample implements OnDestroy, AfterViewInit {
  @ViewChild('monitored') monitoredEl: ElementRef<HTMLElement>;

  origin = this.formatOrigin(null);

  constructor(public focusMonitor: FocusMonitor) {}

  ngAfterViewInit() {
    this.focusMonitor.monitor(this.monitoredEl)
        .subscribe(origin => {
          this.origin = this.formatOrigin(origin);
        });
  }

  ngOnDestroy() {
    this.focusMonitor.stopMonitoring(this.monitoredEl);
  }

  formatOrigin(origin: FocusOrigin): string {
    return origin ? origin + ' focused' : 'blurred';
  }
}
