import {Component, NgModule} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {MdButtonModule, MdMenuModule} from '@angular/material';
import {RouterModule} from '@angular/router';
import {ThemePickerModule} from '../theme-picker/theme-picker';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavBar {}

@NgModule({
  imports: [MdButtonModule, MdMenuModule, RouterModule, ThemePickerModule],
  exports: [NavBar],
  declarations: [NavBar],
})
export class NavBarModule {}
