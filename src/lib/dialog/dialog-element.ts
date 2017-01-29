import {
  Component,
  TemplateRef,
  Input,
  ViewChild,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  NgZone
} from '@angular/core';
import {MdDialog} from './dialog';
import {MdDialogConfig} from './dialog-config';
import {MdDialogRef} from './dialog-ref';
import {Subscription} from 'rxjs/Subscription';

@Component({
  moduleId: module.id,
  selector: 'md-dialog',
  templateUrl: 'dialog-element.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MdDialogElement {
  dialog: MdDialogRef<any>;

  @Input()
  set config(v: MdDialogConfig) {
    if (v) {
      this._config = Object.assign(this._config, v);
    }
  }
  get config() {
    return this._config;
  }

  /** emits event that close attemps happened along with a cause */
  @Output()
  close = new EventEmitter<'escape' | 'backdrop'>(false);

  @ViewChild('mdDialogContentTemplateRef')
  mdDialogContentTemplateRef: TemplateRef<any>;

  @Input()
  set open(state: boolean) {
    if (state) {
      // needed to prevent `Expression has changed after it was checked`
      this._ngZone.onMicrotaskEmpty.first().subscribe(() => {
        this.dialog = this._dialog.openFromTemplateRef(
          this.mdDialogContentTemplateRef,
          this.config
        );

        this._backdropClickSubscription = this.dialog
          .backdropClicked
          .subscribe(() => this.close.emit('backdrop'));

        this._escapePressSubscription = this.dialog
          .escapePressed
          .subscribe(() => this.close.emit('escape'));
      });

    } else if (this.dialog) {
      if (this.dialog) {
        this.dialog.close();

        // remove backdrop/escape subscription only if dialog was actually closed
        this._backdropClickSubscription.unsubscribe();
        this._escapePressSubscription.unsubscribe();
      }
    }
  }

  private _config: MdDialogConfig;
  private _backdropClickSubscription: Subscription;
  private _escapePressSubscription: Subscription;

  constructor(private _dialog: MdDialog, private _ngZone: NgZone) {
    let config = new MdDialogConfig();

    // disable close by default, to make it
    // truly stateless it's default behaviour of
    // https://developer.mozilla.org/en/docs/Web/HTML/Element/dialog
    // as well
    config.disableClose = true;

    this._config = config;
  }
}
