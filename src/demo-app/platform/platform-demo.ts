import {Component} from '@angular/core';
import {Platform, getSupportedInputTypes} from '@uiux/cdk/platform';


@Component({
  moduleId: module.id,
  selector: 'platform-demo',
  templateUrl: 'platform-demo.html',
})
export class PlatformDemo {
  supportedInputTypes = getSupportedInputTypes();

  constructor(public platform: Platform) {}
}
