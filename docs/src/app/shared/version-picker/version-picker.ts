/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ViewEncapsulation, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AsyncPipe} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatTooltip} from '@angular/material/tooltip';
import {normalizedMaterialVersion} from '../normalized-version';

const versionUrl = 'https://material.angular.io/assets/versions.json';

/** Version information with title and redirect url */
interface VersionInfo {
  url: string;
  title: string;
}

@Component({
  selector: 'version-picker',
  templateUrl: './version-picker.html',
  styleUrls: ['./version-picker.scss'],
  imports: [MatButton, MatTooltip, MatMenu, MatMenuItem, MatIcon, MatMenuTrigger, AsyncPipe],
  encapsulation: ViewEncapsulation.None,
})
export class VersionPicker {
  private _http = inject(HttpClient);

  /** The currently running version of Material. */
  materialVersion = normalizedMaterialVersion;
  /** The possible versions of the doc site. */
  docVersions = this._http.get<VersionInfo[]>(versionUrl);

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
