import {ChangeDetectorRef, Component, NgZone, inject} from '@angular/core';
import {A11yModule, FocusOrigin} from '@angular/cdk/a11y';

/** @title Monitoring focus with FocusMonitor */
@Component({
  selector: 'focus-monitor-directives-example',
  templateUrl: 'focus-monitor-directives-example.html',
  styleUrl: 'focus-monitor-directives-example.css',
  imports: [A11yModule],
})
export class FocusMonitorDirectivesExample {
  private _ngZone = inject(NgZone);
  private _cdr = inject(ChangeDetectorRef);

  elementOrigin = this.formatOrigin(null);
  subtreeOrigin = this.formatOrigin(null);

  formatOrigin(origin: FocusOrigin): string {
    return origin ? origin + ' focused' : 'blurred';
  }

  // Workaround for the fact that (cdkFocusChange) emits outside NgZone.
  markForCheck() {
    this._ngZone.run(() => this._cdr.markForCheck());
  }
}
