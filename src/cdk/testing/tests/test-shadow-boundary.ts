import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'test-shadow-boundary',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // tslint:disable-next-line:validate-decorators
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class TestShadowBoundary {}
