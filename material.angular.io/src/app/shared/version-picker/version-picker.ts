import {Component, NgModule} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {materialVersion, VersionInfo} from '../version/version';

const versionUrl = 'https://material.angular.io/assets/versions.json';

@Component({
  selector: 'version-picker',
  templateUrl: './version-picker.html'
})
export class VersionPicker {
  /** The currently running versin of Material. */
  materialVersion = materialVersion;
  /** The possible versions of the doc site. */
  docVersions = this.http.get(versionUrl);

  constructor(private http: HttpClient) {}

  /** Updates the window location if the selected version is a different version. */
  onVersionChanged(version: VersionInfo) {
    if (!version.url.startsWith(window.location.href)) {
      window.location.assign(version.url);
    }
  }
}

@NgModule({
  imports: [MatButtonModule, MatIconModule, MatMenuModule, CommonModule],
  exports: [VersionPicker],
  declarations: [VersionPicker]
})
export class VersionPickerModule {}
