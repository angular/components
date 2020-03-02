import {FocusMonitor, FocusOrigin} from '@angular/cdk/a11y';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild
} from '@angular/core';

/** @title Monitoring focus with FocusMonitor */
@Component({
  selector: 'focus-monitor-overview-example',
  templateUrl: 'focus-monitor-overview-example.html',
  styleUrls: ['focus-monitor-overview-example.css']
})
export class FocusMonitorOverviewExample implements OnDestroy, AfterViewInit {
  @ViewChild('element') element: ElementRef<HTMLElement>;
  @ViewChild('subtree') subtree: ElementRef<HTMLElement>;

  elementOrigin = this.formatOrigin(null);
  subtreeOrigin = this.formatOrigin(null);

  constructor(private _focusMonitor: FocusMonitor) {}

  ngAfterViewInit() {
    this._focusMonitor.monitor(this.element)
        .subscribe(origin => {
          this.elementOrigin = this.formatOrigin(origin);
        });
    this._focusMonitor.monitor(this.subtree, true)
        .subscribe(origin => {
          this.subtreeOrigin = this.formatOrigin(origin);
        });
  }

  ngOnDestroy() {
    this._focusMonitor.stopMonitoring(this.element);
    this._focusMonitor.stopMonitoring(this.subtree);
  }

  formatOrigin(origin: FocusOrigin): string {
    return origin ? origin + ' focused' : 'blurred';
  }
}
