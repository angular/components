import {Component, NgModule} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatTooltipModule} from '@angular/material/tooltip';
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
  styleUrls: ['./version-picker.scss']
})
export class VersionPicker {
  /** The currently running version of Material. */
  materialVersion = normalizedMaterialVersion;
  /** The possible versions of the doc site. */
  docVersions = this.http.get<VersionInfo[]>(versionUrl);

  constructor(private http: HttpClient) {}

  /**
   * Updates the window location if the selected version is a different version.
   * @param version data for use in navigating to the version's path
   */
  onVersionChanged(version: VersionInfo) {
    if (!version.url.startsWith(window.location.href)) {
      window.location.assign(version.url);
    }
  }
}

@NgModule({
  imports: [MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule, CommonModule],
  exports: [VersionPicker],
  declarations: [VersionPicker],
})
export class VersionPickerModule {}
