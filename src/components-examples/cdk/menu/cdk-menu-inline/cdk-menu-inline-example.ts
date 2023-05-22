import {Component} from '@angular/core';
import {CdkMenu, CdkMenuItem} from '@angular/cdk/menu';

/** @title Gmail inline menu. */
@Component({
  selector: 'cdk-menu-inline-example',
  exportAs: 'cdkMenuInlineExample',
  styleUrls: ['cdk-menu-inline-example.css'],
  templateUrl: 'cdk-menu-inline-example.html',
  standalone: true,
  imports: [CdkMenu, CdkMenuItem],
})
export class CdkMenuInlineExample {}
