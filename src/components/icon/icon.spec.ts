import {
  it,
  describe,
  expect,
  beforeEach,
  beforeEachProviders,
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
  provide,
  Component} from 'angular2/core';
import {By} from 'angular2/platform/browser';
import {
  TEST_BROWSER_PLATFORM_PROVIDERS,
  TEST_BROWSER_APPLICATION_PROVIDERS
} from 'angular2/platform/testing/browser';

import {MdIcon} from './icon';
import {MdIconRegistry} from './icon-registry';

const sortedClassNames = (elem: Element) => elem.className.split(' ').sort();

export function main() {
  describe('MdIcon', () => {

    beforeEachProviders(() => [
      MdIconRegistry,
      HTTP_PROVIDERS,
      MockBackend,
      provide(XHRBackend, {useExisting: MockBackend}),
    ]);

    let builder: TestComponentBuilder;
    let mdIconRegistry: MdIconRegistry;
    let httpRequestUrls: string[];

    beforeEach(
        inject([TestComponentBuilder, MdIconRegistry, MockBackend],
        (tcb: TestComponentBuilder, mir: MdIconRegistry, mockBackend: MockBackend) => {
      builder = tcb;
      mdIconRegistry = mir;
      // Set fake responses for various SVG URLs.
      // Keep track of requests so we can verify caching behavior.
      httpRequestUrls = [];
      mockBackend.connections.subscribe((connection: any) => {
        const url = connection.request.url;
        httpRequestUrls.push(url);
        switch (url) {
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
          case 'farm-set-1.svg':
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
          case 'farm-set-2.svg':
            connection.mockRespond(new Response(new ResponseOptions({
              status: 200,
              body: `
                <svg>
                  <defs>
                    <g id="cow"><path d="moo moo"></path></g>
                    <g id="sheep"><path d="baa"></path></g>
                  </defs>
                </svg>
              `,
            })));
            break;
          case 'arrow-set.svg':
            connection.mockRespond(new Response(new ResponseOptions({
              status: 200,
              body: `
                <svg>
                  <defs>
                    <svg id="left"><path d="left"></path></g>
                    <svg id="right"><path d="right"></path></g>
                  </defs>
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

      it('should use alternate icon font if set', (done: () => void) => {
        mdIconRegistry.setDefaultFontSetClass('myfont');
        return builder.createAsync(MdIconLigatureTestApp).then((fixture) => {
          const testComponent = fixture.debugElement.componentInstance;
          const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
          testComponent.iconName = 'home';
          fixture.detectChanges();
          expect(sortedClassNames(mdIconElement)).toEqual(['myfont']);
          done();
        });
      });
    });

    describe('Icons from URLs', () => {
      it('should fetch SVG icon from URL and inline the content', (done: () => void) => {
        return builder.createAsync(MdIconFromSvgUrlTestApp).then((fixture) => {
          const testComponent = fixture.debugElement.componentInstance;
          const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
          let svgElement: any;
          let pathElement: any;

          testComponent.iconUrl = 'cat.svg';
          fixture.detectChanges();
          // An <svg> element should have been added as a child of <md-icon>.
          expect(mdIconElement.children.length).toBe(1);
          svgElement = mdIconElement.children[0];
          expect(svgElement.tagName.toLowerCase()).toBe('svg');
          // Default attributes should be set.
          expect(svgElement.getAttribute('height')).toBe('100%');
          expect(svgElement.getAttribute('height')).toBe('100%');
          // Make sure SVG content is taken from response.
          expect(svgElement.children.length).toBe(1);
          pathElement = svgElement.children[0];
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

          expect(httpRequestUrls).toEqual(['cat.svg', 'dog.svg']);
          // Using an icon from a previously loaded URL should not cause another HTTP request.
          testComponent.iconUrl = 'cat.svg';
          fixture.detectChanges();
          expect(mdIconElement.children.length).toBe(1);
          pathElement = mdIconElement.querySelector('svg path');
          expect(pathElement.getAttribute('d')).toBe('meow');
          expect(httpRequestUrls).toEqual(['cat.svg', 'dog.svg']);

          done();
        });
      });

      it('should register icon URLs by name', (done: () => void) => {
        mdIconRegistry.addSvgIcon('fluffy', 'cat.svg');
        mdIconRegistry.addSvgIcon('fido', 'dog.svg');
        return builder.createAsync(MdIconFromSvgNameTestApp).then((fixture) => {
          const testComponent = fixture.debugElement.componentInstance;
          const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
          let svgElement: any;
          let pathElement: any;

          testComponent.iconName= 'fido';
          fixture.detectChanges();
          expect(mdIconElement.children.length).toBe(1);
          svgElement = mdIconElement.children[0];
          expect(svgElement.tagName.toLowerCase()).toBe('svg');
          expect(svgElement.children.length).toBe(1);
          pathElement = svgElement.children[0];
          expect(pathElement.tagName.toLowerCase()).toBe('path');
          expect(pathElement.getAttribute('d')).toBe('woof');
          // The aria label should be taken from the icon name.
          expect(mdIconElement.getAttribute('aria-label')).toBe('fido');


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
          expect(mdIconElement.getAttribute('aria-label')).toBe('fluffy');

          expect(httpRequestUrls).toEqual(['dog.svg', 'cat.svg']);
          // Using an icon from a previously loaded URL should not cause another HTTP request.
          testComponent.iconName = 'fido';
          fixture.detectChanges();
          expect(mdIconElement.children.length).toBe(1);
          pathElement = mdIconElement.querySelector('svg path');
          expect(pathElement.getAttribute('d')).toBe('woof');
          expect(httpRequestUrls).toEqual(['dog.svg', 'cat.svg']);

          done();
        });
      });

      it('should extract icon from SVG icon set', (done: () => void) => {
        mdIconRegistry.addSvgIconSetInNamespace('farm', 'farm-set-1.svg');
        return builder.createAsync(MdIconFromSvgNameTestApp).then((fixture) => {
          const testComponent = fixture.debugElement.componentInstance;
          const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
          let svgElement: any;
          let pathElement: any;
          let svgChild: any;

          testComponent.iconName = 'farm:pig';
          fixture.detectChanges();
          expect(mdIconElement.children.length).toBe(1);
          svgElement = mdIconElement.children[0];
          expect(svgElement.tagName.toLowerCase()).toBe('svg');
          expect(svgElement.children.length).toBe(1);
          svgChild = svgElement.children[0];
          // The first <svg> child should be the <g id="pig"> element.
          expect(svgChild.tagName.toLowerCase()).toBe('g');
          expect(svgChild.getAttribute('id')).toBe('pig');
          expect(svgChild.children.length).toBe(1);
          pathElement = svgChild.children[0];
          expect(pathElement.tagName.toLowerCase()).toBe('path');
          expect(pathElement.getAttribute('d')).toBe('oink');
          // The aria label should be taken from the icon name (without the icon set portion).
          expect(mdIconElement.getAttribute('aria-label')).toBe('pig');

          // Change the icon, and the SVG element should be replaced.
          testComponent.iconName = 'farm:cow';
          fixture.detectChanges();
          expect(mdIconElement.children.length).toBe(1);
          svgElement = mdIconElement.children[0];
          svgChild = svgElement.children[0];
          // The first <svg> child should be the <g id="cow"> element.
          expect(svgChild.tagName.toLowerCase()).toBe('g');
          expect(svgChild.getAttribute('id')).toBe('cow');
          expect(svgChild.children.length).toBe(1);
          pathElement = svgChild.children[0];
          expect(pathElement.tagName.toLowerCase()).toBe('path');
          expect(pathElement.getAttribute('d')).toBe('moo');
          expect(mdIconElement.getAttribute('aria-label')).toBe('cow');

          done();
        });
      });

      it('should allow multiple icon sets in a namespace', (done: () => void) => {
        mdIconRegistry.addSvgIconSetInNamespace('farm', 'farm-set-1.svg');
        mdIconRegistry.addSvgIconSetInNamespace('farm', 'farm-set-2.svg');
        mdIconRegistry.addSvgIconSetInNamespace('arrows', 'arrow-set.svg');
        return builder.createAsync(MdIconFromSvgNameTestApp).then((fixture) => {
          const testComponent = fixture.debugElement.componentInstance;
          const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
          let svgElement: any;
          let pathElement: any;
          let svgChild: any;

          testComponent.iconName = 'farm:pig';
          fixture.detectChanges();
          expect(mdIconElement.children.length).toBe(1);
          svgElement = mdIconElement.children[0];
          expect(svgElement.tagName.toLowerCase()).toBe('svg');
          expect(svgElement.children.length).toBe(1);
          svgChild = svgElement.children[0];
          // The first <svg> child should be the <g id="pig"> element.
          expect(svgChild.tagName.toLowerCase()).toBe('g');
          expect(svgChild.getAttribute('id')).toBe('pig');
          expect(svgChild.children.length).toBe(1);
          pathElement = svgChild.children[0];
          expect(pathElement.tagName.toLowerCase()).toBe('path');
          expect(pathElement.getAttribute('d')).toBe('oink');
          // The aria label should be taken from the icon name (without the icon set portion).
          expect(mdIconElement.getAttribute('aria-label')).toBe('pig');

          // Both icon sets registered in the 'farm' namespace should have been fetched.
          expect(httpRequestUrls.sort()).toEqual(['farm-set-1.svg', 'farm-set-2.svg']);

          // Change the icon name to one that appears in both icon sets. The icon from the set that
          // was registered last should be used (with 'd' attribute of 'moo moo' instead of 'moo'),
          // and no additional HTTP request should be made.
          testComponent.iconName = 'farm:cow';
          fixture.detectChanges();
          expect(mdIconElement.children.length).toBe(1);
          svgElement = mdIconElement.children[0];
          svgChild = svgElement.children[0];
          // The first <svg> child should be the <g id="cow"> element.
          expect(svgChild.tagName.toLowerCase()).toBe('g');
          expect(svgChild.getAttribute('id')).toBe('cow');
          expect(svgChild.children.length).toBe(1);
          pathElement = svgChild.children[0];
          expect(pathElement.tagName.toLowerCase()).toBe('path');
          expect(pathElement.getAttribute('d')).toBe('moo moo');
          expect(mdIconElement.getAttribute('aria-label')).toBe('cow');
          expect(httpRequestUrls.sort()).toEqual(['farm-set-1.svg', 'farm-set-2.svg']);

          done();
        });
      });
    });

    describe('custom fonts', () => {
      it('should apply CSS classes for custom font and icon', (done: () => void) => {
        mdIconRegistry.registerFontClassAlias('f1', 'font1');
        mdIconRegistry.registerFontClassAlias('f2');
        return builder.createAsync(MdIconCustomFontCssTestApp).then((fixture) => {
          const testComponent = fixture.debugElement.componentInstance;
          const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
          testComponent.fontSet = 'f1';
          testComponent.fontIcon = 'house';
          fixture.detectChanges();
          expect(sortedClassNames(mdIconElement)).toEqual(['font1', 'house']);
          expect(mdIconElement.getAttribute('aria-label')).toBe('house');

          testComponent.fontSet = 'f2';
          testComponent.fontIcon = 'igloo';
          fixture.detectChanges();
          expect(sortedClassNames(mdIconElement)).toEqual(['f2', 'igloo']);
          expect(mdIconElement.getAttribute('aria-label')).toBe('igloo');

          testComponent.fontSet = 'f3';
          testComponent.fontIcon = 'tent';
          fixture.detectChanges();
          expect(sortedClassNames(mdIconElement)).toEqual(['f3', 'tent']);
          expect(mdIconElement.getAttribute('aria-label')).toBe('tent');

          done();
        });
      });
    });

    describe('aria label', () => {
      it('should set aria label from text content if not specified', (done: () => void) => {
        return builder.createAsync(MdIconLigatureTestApp).then((fixture) => {
          const testComponent = fixture.debugElement.componentInstance;
          const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
          testComponent.iconName = 'home';
          fixture.detectChanges();
          expect(mdIconElement.getAttribute('aria-label')).toBe('home');

          testComponent.iconName = 'hand';
          fixture.detectChanges();
          expect(mdIconElement.getAttribute('aria-label')).toBe('hand');

          done();
        });
      });

      it('should use alt tag if aria label is not specified', (done: () => void) => {
        return builder.createAsync(MdIconLigatureWithAriaBindingTestApp).then((fixture) => {
          const testComponent = fixture.debugElement.componentInstance;
          const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
          testComponent.iconName = 'home';
          testComponent.altText = 'castle';
          fixture.detectChanges();
          expect(mdIconElement.getAttribute('aria-label')).toBe('castle');

          testComponent.ariaLabel = 'house';
          fixture.detectChanges();
          expect(mdIconElement.getAttribute('aria-label')).toBe('house');

          done();
        });
      });

      it('should use provided aria label rather than icon name', (done: () => void) => {
        return builder.createAsync(MdIconLigatureWithAriaBindingTestApp).then((fixture) => {
          const testComponent = fixture.debugElement.componentInstance;
          const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
          testComponent.iconName = 'home';
          testComponent.ariaLabel = 'house';
          fixture.detectChanges();
          expect(mdIconElement.getAttribute('aria-label')).toBe('house');
          done();
        });
      });

      it('should use provided aria label rather than font icon', (done: () => void) => {
        return builder.createAsync(MdIconCustomFontCssTestApp).then((fixture) => {
          const testComponent = fixture.debugElement.componentInstance;
          const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
          testComponent.fontSet = 'f1';
          testComponent.fontIcon = 'house';
          testComponent.ariaLabel = 'home';
          fixture.detectChanges();
          expect(mdIconElement.getAttribute('aria-label')).toBe('home');
          done();
        });
      });
    });
  });
}

/** Test components that contain an MdIcon. */
@Component({
  selector: 'test-app',
  template: `<md-icon>{{iconName}}</md-icon>`,
  directives: [MdIcon],
})
class MdIconLigatureTestApp {
  ariaLabel: string = null;
  iconName = '';
}

@Component({
  selector: 'test-app',
  template: `<md-icon aria-label="{{ariaLabel}}" alt="{{altText}}">{{iconName}}</md-icon>`,
  directives: [MdIcon],
})
class MdIconLigatureWithAriaBindingTestApp {
  ariaLabel: string = null;
  iconName = '';
}

@Component({
  selector: 'test-app',
  template: `
      <md-icon fontSet="{{fontSet}}" fontIcon="{{fontIcon}}" aria-label="{{ariaLabel}}"></md-icon>
  `,
  directives: [MdIcon],
})
class MdIconCustomFontCssTestApp {
  ariaLabel: string = null;
  fontSet = '';
  fontIcon = '';
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


// tests
// modification of icon doesn't propagate
// <svg> as icon set children
// icon name not found