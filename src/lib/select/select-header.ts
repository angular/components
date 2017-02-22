import {Directive} from '@angular/core';


/**
 * Fixed header that will be rendered above a select's options.
 */
@Directive({
  selector: 'md-select-header, mat-select-header',
  host: {
    'class': 'mat-select-header',
  }
})
export class MdSelectHeader { }
