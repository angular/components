import {Component, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OverlayModule} from '@angular/cdk/overlay';
import {Menu, MenuTrigger, MenuContent} from '@angular/aria/menu';
import {SimpleMenuItem, SimpleMenuItemIcon, SimpleMenuItemText} from '../simple-menu';

/**
 * @title Menu CDK overlay example
 */
@Component({
  selector: 'menu-cdk-overlay-example',
  templateUrl: 'menu-cdk-overlay-example.html',
  styleUrl: '../menu-example.css',
  imports: [
    CommonModule,
    OverlayModule,
    Menu,
    MenuTrigger,
    MenuContent,
    SimpleMenuItem,
    SimpleMenuItemIcon,
    SimpleMenuItemText,
  ],
})
export class MenuCdkOverlayExample {
  @ViewChild('myMenu') myMenu!: Menu<any>;
}
