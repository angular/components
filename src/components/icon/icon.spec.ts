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
  xit,
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

const sortedClassNames = (elem: Element) => elem.className.split(' ').sort();

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

    describe('Ligature icons', () => {
      it('should add material-icons class by default', (done: () => void) => {
        return builder.createAsync(MdIconLigatureTestApp).then((fixture) => {
          const testComponent = fixture.debugElement.componentInstance;
          const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
          fixture.detectChanges();
          expect(sortedClassNames(mdIconElement)).toEqual(['material-icons']);
          done();
        });
      });

      // This test is disabled because the DOM in the test environment can't read
      // the text content of the md-icon element.
      xit('should set aria label from text content if not specified', (done: () => void) => {
        return builder.createAsync(MdIconLigatureTestApp).then((fixture) => {
          const testComponent = fixture.debugElement.componentInstance;
          const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
          fixture.detectChanges();
          expect(mdIconElement.getAttribute('aria-label')).toBe('home');
          done();
        });
      });

      // And getAttribute doesn't see values set by Renderer.setElementAttribute?
      xit('should use provided aria label', (done: () => void) => {
        return builder.createAsync(MdIconLigatureTestApp).then((fixture) => {
          const testComponent = fixture.debugElement.componentInstance;
          const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
          testComponent.ariaLabel = 'house';
          fixture.detectChanges();
          expect(mdIconElement.getAttribute('aria-label')).toBe('house');
          done();
        });
      });
    });
  });
}

/** Test component that contains an MdIcon. */
@Component({
  selector: 'test-app',
  template: `<md-icon foo="bar" aria-label="{{ariaLabel}}">{{iconName}}</md-icon>`,
  directives: [MdIcon],
})
class MdIconLigatureTestApp {
  ariaLabel: string = null;
  iconName = 'home';
}
