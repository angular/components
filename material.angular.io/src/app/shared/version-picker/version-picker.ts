import {Component, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule, MatMenuModule} from '@angular/material';
import {docVersions, materialVersion, VersionInfo} from '../version/version'

@Component({
  selector: 'version-picker',
  templateUrl: './version-picker.html'
})
export class VersionPicker {

  _versionRegex = /\d+.\d+.\d+/;
  docVersions = docVersions;

  materialVersion = materialVersion;

  displayVersion = materialVersion.match(this._versionRegex)[0];

  onVersionChanged(version: VersionInfo) {
    if (version.title.match(this._versionRegex)[0] !== this.displayVersion) {
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
