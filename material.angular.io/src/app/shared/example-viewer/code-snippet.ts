import {ChangeDetectionStrategy, Component, forwardRef, input, viewChild} from '@angular/core';
import {DocViewer} from '../doc-viewer/doc-viewer';

@Component({
  selector: 'code-snippet',
  templateUrl: './code-snippet.html',
  styleUrls: ['./example-viewer.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [forwardRef(() => DocViewer)],
})
export class CodeSnippet {
  readonly source = input<string>();
  readonly viewer = viewChild.required<DocViewer>('viewer');
}
