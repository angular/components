import {Component} from '@angular/core';
import {CdkMenu, CdkMenuItem} from '@angular/cdk/menu';

/** @title Gmail inline menu. */
@Component({
  selector: 'cdk-menu-inline-example',
  styleUrl: 'cdk-menu-inline-example.css',
  templateUrl: 'cdk-menu-inline-example.html',
  imports: [CdkMenu, CdkMenuItem],
})
export class CdkMenuInlineExample {}
