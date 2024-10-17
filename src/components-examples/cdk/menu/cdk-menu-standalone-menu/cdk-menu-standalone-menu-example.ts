import {Component} from '@angular/core';
import {CdkMenu, CdkMenuItem, CdkMenuTrigger} from '@angular/cdk/menu';

/** @title Menu with Standalone Trigger. */
@Component({
  selector: 'cdk-menu-standalone-menu-example',
  styleUrl: 'cdk-menu-standalone-menu-example.css',
  templateUrl: 'cdk-menu-standalone-menu-example.html',
  imports: [CdkMenuTrigger, CdkMenu, CdkMenuItem],
})
export class CdkMenuStandaloneMenuExample {}
