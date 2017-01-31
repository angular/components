import {
  Component,
  Directive,
  TemplateRef,
  ViewContainerRef,
  Input,
  ViewChild,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import {MdDialog} from './dialog';
import {MdDialogRef} from './dialog-ref';
import {TemplatePortal} from '../core';

@Directive({
  selector: '[mdDialogPortal]'
})
export class MdDialogPortal extends TemplatePortal {
  constructor(templateRef: TemplateRef<any>, viewContainerRef: ViewContainerRef) {
    super(templateRef, viewContainerRef);
  }
}

@Component({
  selector: 'md-dialog',
  templateUrl: './dialog-element.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MdDialogElement {
  dialog: MdDialogRef<any>;

  @Output()
  close = new EventEmitter<void>(false);

  @ViewChild(MdDialogPortal)
  dialogPortal: MdDialogPortal;

  @Input()
  set open(state: boolean) {
    if (state) {
      setTimeout(() => {

        this.dialog = this._dialog.openFromPortal(this.dialogPortal, {
          disableClose: true
        });

        this.dialog.backdropClick$.subscribe(() => {
          this.close.emit();
        });

      });


    } else if (this.dialog) {
      this.dialog.close();
    }
  }

  constructor(private _dialog: MdDialog) {}
}

