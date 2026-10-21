/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation, computed} from '@angular/core';
import {httpResource} from '@angular/common/http';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatTooltip} from '@angular/material/tooltip';
import {normalizedMaterialVersion} from '../normalized-version';

const versionUrl = 'https://material.angular.dev/assets/versions.json';

/** Version information with title and redirect url */
interface VersionInfo {
  url: string;
  title: string;
}

@Component({
  selector: 'version-picker',
  templateUrl: './version-picker.html',
  styleUrls: ['./version-picker.scss'],
  imports: [MatButton, MatTooltip, MatMenu, MatMenuItem, MatIcon, MatMenuTrigger],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class VersionPicker {
  private readonly _versions = httpResource<VersionInfo[]>(() => versionUrl);

  /** The currently running version of Material. */
  materialVersion = normalizedMaterialVersion;
  /** The possible versions of the doc site. Empty if they couldn't be loaded. */
  readonly docVersions = computed(() => (this._versions.hasValue() ? this._versions.value() : []));

  /**
   * Updates the window location if the selected version is a different version.
   * @param version data for use in navigating to the version's path
   */
  onVersionChanged(version: VersionInfo) {
    if (!version.url.startsWith(window.location.origin)) {
      window.location.assign(
        window.location.pathname
          ? version.url + window.location.pathname + window.location.hash
          : version.url,
      );
    }
  }
}
