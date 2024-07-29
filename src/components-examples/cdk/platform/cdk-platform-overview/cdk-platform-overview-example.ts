import {Component, inject} from '@angular/core';
import {
  getSupportedInputTypes,
  Platform,
  supportsPassiveEventListeners,
  supportsScrollBehavior,
} from '@angular/cdk/platform';

/**
 * @title Platform overview
 */
@Component({
  selector: 'cdk-platform-overview-example',
  templateUrl: 'cdk-platform-overview-example.html',
  standalone: true,
})
export class CdkPlatformOverviewExample {
  platform = inject(Platform);

  supportedInputTypes = Array.from(getSupportedInputTypes()).join(', ');
  supportsPassiveEventListeners = supportsPassiveEventListeners();
  supportsScrollBehavior = supportsScrollBehavior();
}
