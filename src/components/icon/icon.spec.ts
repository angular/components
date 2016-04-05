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
  describe('MdIcon', () => {
  
    beforeEachProviders(() => [
      MdIconProvider,
      HTTP_PROVIDERS,
      MockBackend,
      provide(XHRBackend, {useExisting: MockBackend}),
    ]);
  
    let builder: TestComponentBuilder;
    let mdIconProvider: MdIconProvider;

    beforeEach(
        inject([TestComponentBuilder, MdIconProvider, MockBackend],
        (tcb: TestComponentBuilder, mip: MdIconProvider, mockBackend: MockBackend) => {
      builder = tcb;
      mdIconProvider = mip;
      // Set fake responses for various SVG URLs.
      mockBackend.connections.subscribe((connection: any) => {
        switch (connection.request.url) {
          case 'cat.svg':
            connection.mockRespond(new Response(new ResponseOptions({
              status: 200,
              body: '<svg><path d="meow"></path></svg>',
            })));
            break;
          case 'dog.svg':
            connection.mockRespond(new Response(new ResponseOptions({
              status: 200,
              body: '<svg><path d="woof"></path></svg>',
            })));
            break;
          case 'farm-set.svg':
            connection.mockRespond(new Response(new ResponseOptions({
              status: 200,
              body: `
                <svg>
                  <g id="pig"><path d="oink"></path></g>
                  <g id="cow"><path d="moo"></path></g>
                </svg>
              `,
            })));
            break;
        }
      });
    }));

    describe('Ligature icons', () => {
      it('should add material-icons class by default', (done: () => void) => {
        return builder.createAsync(MdIconLigatureTestApp).then((fixture) => {
          const testComponent = fixture.debugElement.componentInstance;
          const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
          testComponent.iconName = 'home';
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
          testComponent.iconName = 'home';
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
          testComponent.iconName = 'home';
          testComponent.ariaLabel = 'house';
          fixture.detectChanges();
          expect(mdIconElement.getAttribute('aria-label')).toBe('house');
          done();
        });
      });
    });

    describe('Icons from URLs', () => {
      it('should fetch SVG icon from URL and inline the content', (done: () => void) => {
        return builder.createAsync(MdIconFromSvgUrlTestApp).then((fixture) => {
          const testComponent = fixture.debugElement.componentInstance;
          const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
          testComponent.iconUrl = 'cat.svg';
          fixture.detectChanges();

          // An <svg> element should have been added as a child of <md-icon>.
          expect(mdIconElement.children.length).toBe(1);
          let svgElement = mdIconElement.children[0];
          expect(svgElement.tagName.toLowerCase()).toBe('svg');
          // Default attributes should be set.
          expect(svgElement.getAttribute('height')).toBe('100%');
          expect(svgElement.getAttribute('height')).toBe('100%');
          expect(svgElement.getAttribute('viewBox')).toBe('0 0 24 24');
          // Make sure SVG content is taken from response.
          expect(svgElement.children.length).toBe(1);
          let pathElement = svgElement.children[0];
          expect(pathElement.tagName.toLowerCase()).toBe('path');
          expect(pathElement.getAttribute('d')).toBe('meow');

          // Change the icon, and the SVG element should be replaced.
          testComponent.iconUrl = 'dog.svg';
          fixture.detectChanges();
          expect(mdIconElement.children.length).toBe(1);
          svgElement = mdIconElement.children[0];
          expect(svgElement.tagName.toLowerCase()).toBe('svg');
          expect(svgElement.children.length).toBe(1);
          pathElement = svgElement.children[0];
          expect(pathElement.tagName.toLowerCase()).toBe('path');
          expect(pathElement.getAttribute('d')).toBe('woof');

          done();
        });
      });

      it('should register icon URLs by name', (done: () => void) => {
        mdIconProvider.registerIcon('fluffy', 'cat.svg');
        mdIconProvider.registerIcon('fido', 'dog.svg');
        return builder.createAsync(MdIconFromSvgNameTestApp).then((fixture) => {
          const testComponent = fixture.debugElement.componentInstance;
          const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
          testComponent.iconName= 'fido';
          fixture.detectChanges();
          expect(mdIconElement.children.length).toBe(1);
          let svgElement = mdIconElement.children[0];
          expect(svgElement.tagName.toLowerCase()).toBe('svg');
          expect(svgElement.children.length).toBe(1);
          let pathElement = svgElement.children[0];
          expect(pathElement.tagName.toLowerCase()).toBe('path');
          expect(pathElement.getAttribute('d')).toBe('woof');

          // Change the icon, and the SVG element should be replaced.
          testComponent.iconName = 'fluffy';
          fixture.detectChanges();
          expect(mdIconElement.children.length).toBe(1);
          svgElement = mdIconElement.children[0];
          expect(svgElement.tagName.toLowerCase()).toBe('svg');
          expect(svgElement.children.length).toBe(1);
          pathElement = svgElement.children[0];
          expect(pathElement.tagName.toLowerCase()).toBe('path');
          expect(pathElement.getAttribute('d')).toBe('meow');

          done();
        });
      });

      it('should extract icon from SVG icon set', (done: () => void) => {
        mdIconProvider.registerIconSet('farm', 'farm-set.svg');
        return builder.createAsync(MdIconFromSvgNameTestApp).then((fixture) => {
          const testComponent = fixture.debugElement.componentInstance;
          const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
          testComponent.iconName = 'farm:pig';
          fixture.detectChanges();
          expect(mdIconElement.children.length).toBe(1);
          let svgElement = mdIconElement.children[0];
          expect(svgElement.tagName.toLowerCase()).toBe('svg');
          expect(svgElement.children.length).toBe(1);
          let svgChild = svgElement.children[0];
          // The first <svg> child should be the <g id="pig"> element.
          expect(svgChild.tagName.toLowerCase()).toBe('g');
          expect(svgChild.getAttribute('id')).toBe('pig');
          expect(svgChild.children.length).toBe(1);
          let pathElement = svgChild.children[0];
          expect(pathElement.tagName.toLowerCase()).toBe('path');
          expect(pathElement.getAttribute('d')).toBe('oink');

          // Change the icon, and the SVG element should be replaced.
          testComponent.iconName = 'farm:cow';
          fixture.detectChanges();
          expect(mdIconElement.children.length).toBe(1);
          svgElement = mdIconElement.children[0];
          svgChild = svgElement.children[0];
          // The first <svg> child should be the <g id="pig"> element.
          expect(svgChild.tagName.toLowerCase()).toBe('g');
          expect(svgChild.getAttribute('id')).toBe('cow');
          expect(svgChild.children.length).toBe(1);
          pathElement = svgChild.children[0];
          expect(pathElement.tagName.toLowerCase()).toBe('path');
          expect(pathElement.getAttribute('d')).toBe('moo');

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
  iconName = '';
}

@Component({
  selector: 'test-app',
  template: `<md-icon svgSrc="{{iconUrl}}" aria-label="{{ariaLabel}}"></md-icon>`,
  directives: [MdIcon],
})
class MdIconFromSvgUrlTestApp {
  ariaLabel: string = null;
  iconUrl = '';
}

@Component({
  selector: 'test-app',
  template: `<md-icon svgIcon="{{iconName}}" aria-label="{{ariaLabel}}"></md-icon>`,
  directives: [MdIcon],
})
class MdIconFromSvgNameTestApp {
  ariaLabel: string = null;
  iconName = '';
}
