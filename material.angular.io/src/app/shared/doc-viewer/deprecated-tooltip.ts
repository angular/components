import {Component} from '@angular/core';
import {MatTooltipModule} from '@angular/material/tooltip';

/**
 * This component is responsible for showing the
 * deprecated fields throughout API from material repo,
 *
 * When deprecated docs content is generated like:
 *
 * <div class="docs-api-class-deprecated-marker"
 *  title="Will be removed in v21.0.0 or later">
 *  Deprecated
 * </div>
 *
 * It uses `title` attribute to show information regarding
 * deprecation and other information regarding deprecation
 * isnt shown either.
 *
 * We are gonna use this component to show deprecation
 * information using the `material/tooltip`, the information
 * would contain when the field is being deprecated and what
 * are the alternatives to it which both are extracted from
 * `breaking-change` and `deprecated`.
 */
@Component({
  selector: 'deprecated-field',
  template: `<div class="deprecated-content" 
    [matTooltip]="message">
  </div>`,
  standalone: true,
  imports: [MatTooltipModule],
})
export class DeprecatedFieldComponent {
  /** Message regarding the deprecation  */
  message = '';
}
