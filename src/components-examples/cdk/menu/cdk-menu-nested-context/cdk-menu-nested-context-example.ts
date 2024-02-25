import {Component} from '@angular/core';
import {CdkMenu, CdkMenuItem, CdkContextMenuTrigger} from '@angular/cdk/menu';

/** @title Nested context menus. */
@Component({
  selector: 'cdk-menu-nested-context-example',
  exportAs: 'cdkMenuNestedContextExample',
  styleUrl: 'cdk-menu-nested-context-example.css',
  templateUrl: 'cdk-menu-nested-context-example.html',
  standalone: true,
  imports: [CdkContextMenuTrigger, CdkMenu, CdkMenuItem],
})
export class CdkMenuNestedContextExample {}
