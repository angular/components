/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {IdGenerator} from '@angular/cdk/a11y';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  Inject,
  inject,
  InjectionToken,
  Input,
  Optional,
  ViewEncapsulation,
} from '@angular/core';
import {MAT_OPTION_PARENT_COMPONENT, MatOptionParentComponent} from './option-parent';

// Notes on the accessibility pattern used for `mat-optgroup`.
// The option group has two different "modes": regular and inert. The regular mode uses the
// recommended a11y pattern which has `role="group"` on the group element with `aria-labelledby`
// pointing to the label. This works for `mat-select`, but it seems to hit a bug for autocomplete
// under VoiceOver where the group doesn't get read out at all. The bug appears to be that if
// there's __any__ a11y-related attribute on the group (e.g. `role` or `aria-labelledby`),
// VoiceOver on Safari won't read it out.
// We've introduced the `inert` mode as a workaround. Under this mode, all a11y attributes are
// removed from the group, and we get the screen reader to read out the group label by mirroring it
// inside an invisible element in the option. This is sub-optimal, because the screen reader will
// repeat the group label on each navigation, whereas the default pattern only reads the group when
// the user enters a new group. The following alternate approaches were considered:
// 1. Reading out the group label using the `LiveAnnouncer` solves the problem, but we can't control
//    when the text will be read out so sometimes it comes in too late or never if the user
//    navigates quickly.
// 2. `<mat-option aria-describedby="groupLabel"` - This works on Safari, but VoiceOver in Chrome
//    won't read out the description at all.
// 3. `<mat-option aria-labelledby="optionLabel groupLabel"` - This works on Chrome, but Safari
//     doesn't read out the text at all. Furthermore, on

// Counter for unique group ids.

/**
 * Injection token that can be used to reference instances of `MatOptgroup`. It serves as
 * alternative token to the actual `MatOptgroup` class which could cause unnecessary
 * retention of the class and its component metadata.
 */
export const MAT_OPTGROUP = new InjectionToken<MatOptgroup>('MatOptgroup');

/**
 * Component that is used to group instances of `mat-option`.
 */
@Component({
  selector: 'mat-optgroup',
  exportAs: 'matOptgroup',
  templateUrl: 'optgroup.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: 'optgroup.css',
  host: {
    'class': 'mat-mdc-optgroup',
    '[attr.role]': '_inert ? null : "group"',
    '[attr.aria-disabled]': '_inert ? null : disabled.toString()',
    '[attr.aria-labelledby]': '_inert ? null : _labelId',
  },
  providers: [{provide: MAT_OPTGROUP, useExisting: MatOptgroup}],
  standalone: true,
})
export class MatOptgroup {
  /** Generator for assigning unique IDs to DOM elements. */
  private _idGenerator = inject(IdGenerator);

  /** Label for the option group. */
  @Input() label: string;

  /** whether the option group is disabled. */
  @Input({transform: booleanAttribute}) disabled: boolean = false;

  /** Unique id for the underlying label. */
  _labelId: string = this._idGenerator.getId('mat-optgroup-label-');

  /** Whether the group is in inert a11y mode. */
  _inert: boolean;

  constructor(@Inject(MAT_OPTION_PARENT_COMPONENT) @Optional() parent?: MatOptionParentComponent) {
    this._inert = parent?.inertGroups ?? false;
  }
}
