import {Component, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule, MatMenuModule} from '@angular/material';
import {docVersions, materialVersion, VersionInfo} from '../version/version';

@Component({
  selector: 'version-picker',
  templateUrl: './version-picker.html'
})
export class VersionPicker {
  /** The currently running versin of Material. */
  materialVersion = materialVersion;
  /** The possible versions of the doc site. */
  docVersions = docVersions;

  /** Updates the window location if the selected version is a different version. */
  onVersionChanged(version: VersionInfo) {
    if (!version.url.startsWith(window.location.href)) {
      window.location.assign(version.url);
    }
  }
}

@NgModule({
  imports: [MatButtonModule, MatMenuModule, CommonModule],
  exports: [VersionPicker],
  declarations: [VersionPicker]
})
export class VersionPickerModule {}
