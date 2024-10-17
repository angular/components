import {Component} from '@angular/core';
import {CdkContextMenuTrigger, CdkMenuItem, CdkMenu} from '@angular/cdk/menu';

/** @title Context menu. */
@Component({
  selector: 'cdk-menu-context-example',
  exportAs: 'cdkMenuContextExample',
  styleUrl: 'cdk-menu-context-example.css',
  templateUrl: 'cdk-menu-context-example.html',
  imports: [CdkContextMenuTrigger, CdkMenu, CdkMenuItem],
})
export class CdkMenuContextExample {}
