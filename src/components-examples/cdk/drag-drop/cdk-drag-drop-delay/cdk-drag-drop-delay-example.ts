import {Component} from '@angular/core';
import {CdkDrag} from '@angular/cdk/drag-drop';

/**
 * @title Delayed dragging
 */
@Component({
  selector: 'cdk-drag-drop-delay-example',
  templateUrl: 'cdk-drag-drop-delay-example.html',
  styleUrls: ['cdk-drag-drop-delay-example.css'],
  standalone: true,
  imports: [CdkDrag],
})
export class CdkDragDropDelayExample {}
