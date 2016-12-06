import {Component} from '@angular/core';
import {MdFeatureDetector, MdPlatform} from '@angular/material';


@Component({
  moduleId: module.id,
  selector: 'platform-demo',
  templateUrl: 'platform-demo.html',
})
export class PlatformDemo {
  constructor(public feature: MdFeatureDetector, public platform: MdPlatform) {}
}
