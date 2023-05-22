import {Component} from '@angular/core';
import {CdkContextMenuTrigger, CdkMenuItem, CdkMenu} from '@angular/cdk/menu';

/** @title Context menu. */
@Component({
  selector: 'cdk-menu-context-example',
  exportAs: 'cdkMenuContextExample',
  styleUrls: ['cdk-menu-context-example.css'],
  templateUrl: 'cdk-menu-context-example.html',
  standalone: true,
  imports: [CdkContextMenuTrigger, CdkMenu, CdkMenuItem],
})
export class CdkMenuContextExample {}
