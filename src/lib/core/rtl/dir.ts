import {
  Directive,
  HostBinding,
  Output,
  Input,
  EventEmitter
} from '@angular/core';
import {GlobalDirAccessor} from './global-dir-accessor';
import {ActiveLayoutDirection} from './active-layout-direction';

export type LayoutDirection = 'ltr' | 'rtl';

/**
 * Directive to listen for changes of direction of part of the DOM.
 *
 * Applications should use this directive instead of the native attribute so that Material
 * components can listen on changes of direction.
 */
@Directive({
  selector: '[dir]',
  // TODO(hansl): maybe `$implicit` isn't the best option here, but for now that's the best we got.
  exportAs: '$implicit',
  providers: [
    {provide: GlobalDirAccessor, useExisting: Dir}
  ]
})
export class Dir implements ActiveLayoutDirection {
  /** Layout direction of the element. */
  @Input('dir') _dir: LayoutDirection = 'ltr';

  /** Event emitted when the direction changes. */
  @Output() dirChange = new EventEmitter<void>();

  /** @docs-private */
  @HostBinding('attr.dir')
  get dir(): LayoutDirection {
    return this._dir;
  }
  set dir(v: LayoutDirection) {
    let old = this._dir;
    this._dir = v;
    if (old != this._dir) {
      this.dirChange.emit();
    }
  }

  /** Current layout direction of the element. */
  get value(): LayoutDirection { return this.dir; }

  getActiveDirection() {
    return Promise.resolve(this._dir);
  }
}
