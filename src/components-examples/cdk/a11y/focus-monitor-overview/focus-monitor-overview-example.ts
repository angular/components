import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import {FocusMonitor, FocusOrigin} from '@angular/cdk/a11y';

/** @title Monitoring focus with FocusMonitor */
@Component({
  selector: 'focus-monitor-overview-example',
  templateUrl: 'focus-monitor-overview-example.html',
  styleUrl: 'focus-monitor-overview-example.css',
  standalone: true,
})
export class FocusMonitorOverviewExample implements OnDestroy, AfterViewInit {
  private _focusMonitor = inject(FocusMonitor);
  private _cdr = inject(ChangeDetectorRef);
  private _ngZone = inject(NgZone);

  @ViewChild('element') element: ElementRef<HTMLElement>;
  @ViewChild('subtree') subtree: ElementRef<HTMLElement>;

  elementOrigin = this.formatOrigin(null);
  subtreeOrigin = this.formatOrigin(null);

  ngAfterViewInit() {
    this._focusMonitor.monitor(this.element).subscribe(origin =>
      this._ngZone.run(() => {
        this.elementOrigin = this.formatOrigin(origin);
        this._cdr.markForCheck();
      }),
    );
    this._focusMonitor.monitor(this.subtree, true).subscribe(origin =>
      this._ngZone.run(() => {
        this.subtreeOrigin = this.formatOrigin(origin);
        this._cdr.markForCheck();
      }),
    );
  }

  ngOnDestroy() {
    this._focusMonitor.stopMonitoring(this.element);
    this._focusMonitor.stopMonitoring(this.subtree);
  }

  formatOrigin(origin: FocusOrigin): string {
    return origin ? origin + ' focused' : 'blurred';
  }
}
