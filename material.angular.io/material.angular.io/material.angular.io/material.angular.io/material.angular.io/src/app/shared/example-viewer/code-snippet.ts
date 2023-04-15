import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
  forwardRef
} from '@angular/core';
import {DocViewer} from '../doc-viewer/doc-viewer';

@Component({
  selector: 'code-snippet',
  templateUrl: './code-snippet.html',
  styleUrls: ['./example-viewer.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [forwardRef(() => DocViewer)]
})
export class CodeSnippet {
  @Input() source: string | undefined;
  @ViewChild('viewer') viewer!: DocViewer;
}
