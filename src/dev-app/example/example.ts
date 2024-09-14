/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnInit,
  ViewContainerRef,
  inject,
} from '@angular/core';
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {CommonModule} from '@angular/common';
import {EXAMPLE_COMPONENTS} from '@angular/components-examples';
import {loadExample} from '@angular/components-examples/private';

@Component({
  selector: 'material-example',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (showLabel) {
      <div class="label">
        <span class="title"> {{title}} </span>
        <span class="id"> <{{id}}> </span>
      </div>
    }

    @if (!id) {
      <div>
        Could not find example {{id}}
      </div>
    }
  `,
  styles: `
    .label {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin: 16px 0;
    }

    .title {
      font-size: 20px;
      font-weight: 500;
    }

    .id {
      font-size: 13px;
      font-family: monospace;
      color: #666;
      white-space: pre;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Example implements OnInit {
  private _injector = inject(Injector);
  private _viewContainerRef = inject(ViewContainerRef);
  private _changeDetectorRef = inject(ChangeDetectorRef);

  /** ID of the material example to display. */
  @Input() id: string;

  @Input()
  get showLabel(): boolean {
    return this._showLabel;
  }
  set showLabel(v: BooleanInput) {
    this._showLabel = coerceBooleanProperty(v);
  }
  _showLabel: boolean;

  title: string;

  async ngOnInit() {
    this.title = EXAMPLE_COMPONENTS[this.id].title;

    const example = await loadExample(this.id, this._injector);
    this._viewContainerRef.createComponent(example.component, {injector: example.injector});
    this._changeDetectorRef.markForCheck();
  }
}
