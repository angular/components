import {Component} from '@angular/core';
import {
  CdkMenuItemRadio,
  CdkMenuItemCheckbox,
  CdkMenuGroup,
  CdkMenu,
  CdkMenuTrigger,
  CdkMenuItem,
  CdkMenuBar,
} from '@angular/cdk/menu';

/** @title Google Docs Menu Bar. */
@Component({
  selector: 'cdk-menu-menubar-example',
  exportAs: 'cdkMenuMenubarExample',
  styleUrl: 'cdk-menu-menubar-example.css',
  templateUrl: 'cdk-menu-menubar-example.html',
  imports: [
    CdkMenuBar,
    CdkMenuItem,
    CdkMenuTrigger,
    CdkMenu,
    CdkMenuGroup,
    CdkMenuItemCheckbox,
    CdkMenuItemRadio,
  ],
})
export class CdkMenuMenubarExample {}
