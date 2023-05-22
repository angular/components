import {Component} from '@angular/core';
import {OverlayModule} from '@angular/cdk/overlay';

/**
 * @title Overlay basic example
 */
@Component({
  selector: 'cdk-overlay-basic-example',
  templateUrl: './cdk-overlay-basic-example.html',
  styleUrls: ['./cdk-overlay-basic-example.css'],
  standalone: true,
  imports: [OverlayModule],
})
export class CdkOverlayBasicExample {
  isOpen = false;
}
