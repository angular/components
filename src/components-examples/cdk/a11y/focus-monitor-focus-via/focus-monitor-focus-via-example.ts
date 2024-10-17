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
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';

/** @title Focusing with a specific FocusOrigin */
@Component({
  selector: 'focus-monitor-focus-via-example',
  templateUrl: 'focus-monitor-focus-via-example.html',
  styleUrl: 'focus-monitor-focus-via-example.css',
  imports: [MatFormFieldModule, MatSelectModule],
})
export class FocusMonitorFocusViaExample implements OnDestroy, AfterViewInit {
  focusMonitor = inject(FocusMonitor);
  private _cdr = inject(ChangeDetectorRef);
  private _ngZone = inject(NgZone);

  @ViewChild('monitored') monitoredEl: ElementRef<HTMLElement>;

  origin = this.formatOrigin(null);

  ngAfterViewInit() {
    this.focusMonitor.monitor(this.monitoredEl).subscribe(origin =>
      this._ngZone.run(() => {
        this.origin = this.formatOrigin(origin);
        this._cdr.markForCheck();
      }),
    );
  }

  ngOnDestroy() {
    this.focusMonitor.stopMonitoring(this.monitoredEl);
  }

  formatOrigin(origin: FocusOrigin): string {
    return origin ? origin + ' focused' : 'blurred';
  }
}
