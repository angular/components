import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild
} from '@angular/core';
import {DocViewer} from '../doc-viewer/doc-viewer';

@Component({
  selector: 'code-snippet',
  templateUrl: './code-snippet.html',
  styleUrls: ['./example-viewer.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeSnippet {
  @Input() source: string;
  @ViewChild('viewer') viewer: DocViewer;
}
