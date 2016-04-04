import {
  inject,
  TestComponentBuilder,
} from 'angular2/testing';
import {
  HTTP_PROVIDERS,
  BaseRequestOptions,
  Response,
  ResponseOptions,
  Http,
  XHRBackend} from 'angular2/http';
import {
  MockBackend,
  MockConnection} from 'angular2/http/testing';
import {
  it,
  describe,
  ddescribe,
  expect,
  beforeEach,
  beforeEachProviders,
} from '../../core/facade/testing';
import {
  provide,
  Component} from 'angular2/core';
import {By} from 'angular2/platform/browser';
import {
  TEST_BROWSER_PLATFORM_PROVIDERS,
  TEST_BROWSER_APPLICATION_PROVIDERS
} from 'angular2/platform/testing/browser';

import {MdIcon} from './icon';
import {MdIconProvider} from './icon-provider';

export function main() {
  ddescribe('MdIcon', () => {
  
    beforeEachProviders(() => [
      MdIconProvider,
      HTTP_PROVIDERS,
      MockBackend,
      provide(XHRBackend, {useExisting: MockBackend}),
    ]);
  
    let builder: TestComponentBuilder;

    beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
      builder = tcb;
    }));

    it('should add material-icons class by default', (done: () => void) => {
      console.log('in test?');
      return builder.createAsync(MdIconLigatureTestApp).then((fixture) => {
        const testComponent = fixture.debugElement.componentInstance;
        const nativeElement = fixture.debugElement.nativeElement;
        done();
      });
    });
  });
}

/** Test component that contains an MdIcon. */
@Component({
  selector: 'test-app',
  template: `<md-icon>{{iconName}}</md-icon>`,
  directives: [MdIcon],
})
class MdIconLigatureTestApp {
  iconName = 'home';
}
