import {
    Attribute,
    Component,
    ChangeDetectionStrategy,
    ElementRef,
    HostBinding,
    Input,
    ViewEncapsulation,
} from 'angular2/core';
import {isPresent, CONST} from 'angular2/src/facade/lang';
import {OneOf} from '../../core/annotations/one-of';


// TODO(josephperrott): Benchpress tests.
// TODO(josephperrott): Add ARIA attributes for progressbar "for".


/** Display modes of Progress Bar*/
@CONST()
class ProgressMode {
  @CONST() static DETERMINATE = 'determinate';
  @CONST() static INDETERMINATE = 'indeterminate';
  @CONST() static BUFFER = 'buffer';
  @CONST() static QUERY = 'query';
}


/**
 * <md-progress-bar> component.
 */
@Component({
  selector: 'md-progress-bar',
  host: {
    'role': 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
  },
  templateUrl: './components/progress-bar/progress-bar.html',
  styleUrls: ['./components/progress-bar/progress-bar.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdProgressBar {
  /**
   * Value of the progress bar.
   *
   * Input:number, defaults to 0.
   * value_ is bound to the host as the attribute aria-valuenow.
   */
  @Input('value')
  value_: number = 0;
  @HostBinding('attr.aria-valuenow')
  get _value() {
    return this.value_;
  }


  /**
   * Buffer value of the progress bar.
   *
   * Input:number, defaults to 0.
   */
  @Input('bufferValue')
  bufferValue_: number = 0;
  get _bufferValue() {
    return this.bufferValue_;
  }


  /**
   * Mode of the progress bar.
   *
   * Input must be one of the values from ProgressMode, defaults to 'determinate'.
   * mode is bound to the host as the attribute host.
   */
  @Input()
  @OneOf([ProgressMode.DETERMINATE, ProgressMode.INDETERMINATE, ProgressMode.BUFFER, ProgressMode.QUERY])
  mode: string;
  @HostBinding('attr.mode')
  get _mode() {
      return this.mode;
  }


  /** Gets the progress value, returning the clamped value. */
  get value() {
    return this.value_;
  }


  /** Sets the progress value, clamping before setting the internal value. */
  set value(v: number) {
    if (isPresent(v)) {
      this.value_ = MdProgressBar.clamp(v);
    }
  }


  /** Gets the progress buffer value, returning the clamped value. */
  get bufferValue() {
    return this.bufferValue_;
  }


  /** Sets the progress buffer value, clamping before setting the internal buffer value. */
  set bufferValue(v: number) {
    if (isPresent(v)) {
      this.bufferValue_ = MdProgressBar.clamp(v);
    }
  }


  /** Gets the current transform value for the progress bar's primary indicator. */
  primaryTransform() {
    let scale = this.value / 100;
    return `scaleX(${scale})`;
  }


  /**
   * Gets the current transform value for the progress bar's buffer indicator.  Only used if the progress mode is set
   * to buffer, otherwise returns an undefined, causing no transformation.
   */
  bufferTransform() {
    if (this.mode == ProgressMode.BUFFER) {
      let scale = this.bufferValue / 100;
      return `scaleX(${scale})`;
    }
  }


  /** Clamps a value to be between two numbers, by default 0 and 100. */
  static clamp(v: number, min: number = 0, max: number=100) {
    return Math.max(min, Math.min(max, v));
  }
}
