import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import {FirebaseService} from '../firebase.service';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultComponent {

  /** Test name, display on top of the result card */
  testName: string;

  /** Test, diff and golden image urls */
  testImageUrl: string;
  diffImageUrl: string;
  goldImageUrl: string;

  /** Test result, auto set collapse to be the same as the result value */
  @Input()
  get result() {
    return this._result;
  }
  set result(value: boolean) {
    this._result = value;
    this.collapse = value;
  }
  _result: boolean;

  get resultText() {
    return this._result ? 'Passed' : 'Failed';
  }

  /** Collapse: whether collapse or expand the card to show images */
  @Input() collapse: boolean = true;

  /** Mode: the result card has three modes, flip, side by side, and diff */
  @Input()
  get mode() {
    return this._mode;
  }
  set mode(value: 'flip' | 'side' | 'diff') {
    this._mode = value;
    this.modeEvent.emit(value);
    this._changeDetectorRef.markForCheck();
  }
  _mode: 'flip' | 'side' | 'diff' = 'diff';

  /** When mode is "flip" whether we show the test image or the golden image */
  @Input()
  get flipping() {
    return this._flipping;
  }

  set flipping(value: boolean) {
    this._flipping = value;
    this.flippingEvent.emit(value);
    this._changeDetectorRef.markForCheck();
  }
   _flipping: boolean = false;

  get collapseIcon() {
    return this.collapse ? 'keyboard_arrow_right' : 'keyboard_arrow_down';
  }

   /** Filename, the test file name. */
  @Input()
  get filename() {
    return this._filename;
  }
  set filename(filename: string) {
    this._filename = `${filename}.screenshot.png`;
    this.testName = filename.replace(/[_]/g, ' ');
    this.service.testRef().child(this._filename).getDownloadURL()
      .then((url) => {
        this.testImageUrl = url;
        this._changeDetectorRef.markForCheck();
      });
    this.service.diffRef().child(this._filename).getDownloadURL()
      .then((url) => {
        this.diffImageUrl = url;
        this._changeDetectorRef.markForCheck();
      });
    this.service.goldRef().child(this._filename).getDownloadURL()
      .then((url) => {
        this.goldImageUrl = url;
        this._changeDetectorRef.markForCheck();
      });
  }
  _filename: string;

  @Output('flippingChange') flippingEvent = new EventEmitter<boolean>();

  @Output('modeChange') modeEvent = new EventEmitter<'flip' | 'side' | 'diff'>();

  @Output('collapseChange') collapseEvent = new EventEmitter<boolean>();

  constructor(public service: FirebaseService, private _changeDetectorRef: ChangeDetectorRef) { }

  flip() {
    this.service.screenshotResult.flipping = !this.service.screenshotResult.flipping;
  }

  toggleCollapse() {
    this.collapse = !this.collapse;
    this.collapseEvent.emit(this.collapse);
  }
}
