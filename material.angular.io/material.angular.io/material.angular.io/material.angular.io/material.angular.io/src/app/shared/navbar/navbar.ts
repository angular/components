import {Component, NgModule} from '@angular/core';
import {MatButtonModule, MatMenuModule} from '@angular/material';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {ThemePickerModule} from '../theme-picker/theme-picker';
import {SECTIONS} from '../documentation-items/documentation-items';

const SECTIONS_KEYS = Object.keys(SECTIONS);

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavBar {
  get sections() {
    return SECTIONS;
  }

  get sectionKeys() {
    return SECTIONS_KEYS;
  }
}

@NgModule({
  imports: [MatButtonModule, MatMenuModule, RouterModule, ThemePickerModule, CommonModule],
  exports: [NavBar],
  declarations: [NavBar],
})
export class NavBarModule {}
