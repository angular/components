import {inject, async, TestBed} from '@angular/core/testing';
import {SafeResourceUrl, DomSanitizer} from '@angular/platform-browser';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {Component} from '@angular/core';
import {MdIconModule} from './index';
import {MdIconRegistry, getMdIconNoHttpProviderError} from './icon-registry';
import {getFakeSvgHttpResponse} from './fake-svgs';
import {wrappedErrorMessage} from '@angular/cdk/testing';


/** Returns the CSS classes assigned to an element as a sorted array. */
function sortedClassNames(element: Element): string[] {
  return element.className.split(' ').sort();
}

/**
 * Verifies that an element contains a single <svg> child element, and returns that child.
 */
function verifyAndGetSingleSvgChild(element: SVGElement): SVGElement {
  expect(element.childNodes.length).toBe(1);
  const svgChild = element.childNodes[0] as SVGElement;
  expect(svgChild.tagName.toLowerCase()).toBe('svg');
  return svgChild;
}

/**
 * Verifies that an element contains a single <path> child element whose "id" attribute has
 * the specified value.
 */
function verifyPathChildElement(element: Element, attributeValue: string): void {
  expect(element.childNodes.length).toBe(1);
  const pathElement = element.childNodes[0] as SVGPathElement;
  expect(pathElement.tagName.toLowerCase()).toBe('path');
  expect(pathElement.getAttribute('id')).toBe(attributeValue);
}


describe('MdIcon', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MdIconModule],
      declarations: [
        IconWithColor,
        IconWithLigature,
        IconWithCustomFontCss,
        IconFromSvgName,
        IconWithAriaHiddenFalse,
      ]
    });

    TestBed.compileComponents();
  }));

  let mdIconRegistry: MdIconRegistry;
  let sanitizer: DomSanitizer;
  let httpRequestUrls: string[];
  let http: HttpClient;
  let httpMock: HttpTestingController;

  let deps = [MdIconRegistry, HttpClient, HttpTestingController, DomSanitizer];
  beforeEach(inject(deps, (mir: MdIconRegistry, hc: HttpClient,
    hm: HttpTestingController, ds: DomSanitizer) => {
    mdIconRegistry = mir;
    sanitizer = ds;
    http = hc;
    httpMock = hm;

    httpRequestUrls = [];
  }));

  it('should apply class based on color attribute', () => {
    let fixture = TestBed.createComponent(IconWithColor);

    const testComponent = fixture.componentInstance;
    const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
    testComponent.iconName = 'home';
    testComponent.iconColor = 'primary';
    fixture.detectChanges();
    expect(sortedClassNames(mdIconElement)).toEqual(['mat-icon', 'mat-primary', 'material-icons']);
  });

  it('should mark md-icon as aria-hidden by default', () => {
    const fixture = TestBed.createComponent(IconWithLigature);
    const iconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
    expect(iconElement.getAttribute('aria-hidden'))
        .toBe('true', 'Expected the md-icon element has aria-hidden="true" by default');
  });

  it('should not override a user-provided aria-hidden attribute', () => {
    const fixture = TestBed.createComponent(IconWithAriaHiddenFalse);
    const iconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
    expect(iconElement.getAttribute('aria-hidden'))
        .toBe('false', 'Expected the md-icon element has the user-provided aria-hidden value');
  });

  describe('Ligature icons', () => {
    it('should add material-icons class by default', () => {
      let fixture = TestBed.createComponent(IconWithLigature);

      const testComponent = fixture.componentInstance;
      const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
      testComponent.iconName = 'home';
      fixture.detectChanges();
      expect(sortedClassNames(mdIconElement)).toEqual(['mat-icon', 'material-icons']);
    });

    it('should use alternate icon font if set', () => {
      mdIconRegistry.setDefaultFontSetClass('myfont');

      let fixture = TestBed.createComponent(IconWithLigature);

      const testComponent = fixture.componentInstance;
      const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
      testComponent.iconName = 'home';
      fixture.detectChanges();
      expect(sortedClassNames(mdIconElement)).toEqual(['mat-icon', 'myfont']);
    });
  });

  describe('Icons from URLs', () => {
    it('should register icon URLs by name', () => {
      addRemoteIcon(...[
        { name: 'fluffy', url: 'cat.svg', isTrusted: true },
        { name: 'fido', url: 'dog.svg', isTrusted: true }
      ]);

      let fixture = TestBed.createComponent(IconFromSvgName);
      const testComponent = fixture.componentInstance;
      const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
      let svgElement: SVGElement;

      testComponent.iconName = 'fido';
      fixture.detectChanges();
      svgElement = verifyAndGetSingleSvgChild(mdIconElement);
      verifyPathChildElement(svgElement, 'woof');

      // Change the icon, and the SVG element should be replaced.
      testComponent.iconName = 'fluffy';
      fixture.detectChanges();
      svgElement = verifyAndGetSingleSvgChild(mdIconElement);
      verifyPathChildElement(svgElement, 'meow');

      expect(httpRequestUrls).toEqual(['dog.svg', 'cat.svg']);
      // Using an icon from a previously loaded URL should not cause another HTTP request.
      testComponent.iconName = 'fido';
      fixture.detectChanges();
      svgElement = verifyAndGetSingleSvgChild(mdIconElement);
      verifyPathChildElement(svgElement, 'woof');
      expect(httpRequestUrls).toEqual(['dog.svg', 'cat.svg']);
    });

    it('should throw an error when using an untrusted icon url', () => {
      addRemoteIcon({ name: 'fluffy', url: 'farm-set-1.svg', isTrusted: false });

      expect(() => {
        let fixture = TestBed.createComponent(IconFromSvgName);
        fixture.componentInstance.iconName = 'fluffy';
        fixture.detectChanges();
      }).toThrowError(/unsafe value used in a resource URL context/);
    });

    it('should throw an error when using an untrusted icon set url', () => {
      addRemoteIconSetInNamespace({ namespace: 'farm', url: 'farm-set-1.svg', isTrusted: false });

      expect(() => {
        let fixture = TestBed.createComponent(IconFromSvgName);
        fixture.componentInstance.iconName = 'farm:pig';
        fixture.detectChanges();
      }).toThrowError(/unsafe value used in a resource URL context/);
    });

    it('should extract icon from SVG icon set', () => {
      addRemoteIconSetInNamespace({ namespace: 'farm', url: 'farm-set-1.svg', isTrusted: true });

      let fixture = TestBed.createComponent(IconFromSvgName);

      const testComponent = fixture.componentInstance;
      const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
      let svgElement: any;
      let svgChild: any;

      testComponent.iconName = 'farm:pig';
      fixture.detectChanges();

      expect(mdIconElement.childNodes.length).toBe(1);
      svgElement = verifyAndGetSingleSvgChild(mdIconElement);
      expect(svgElement.childNodes.length).toBe(1);
      svgChild = svgElement.childNodes[0];
      // The first <svg> child should be the <g id="pig"> element.
      expect(svgChild.tagName.toLowerCase()).toBe('g');
      expect(svgChild.getAttribute('id')).toBe('pig');
      verifyPathChildElement(svgChild, 'oink');

      // Change the icon, and the SVG element should be replaced.
      testComponent.iconName = 'farm:cow';
      fixture.detectChanges();
      svgElement = verifyAndGetSingleSvgChild(mdIconElement);
      svgChild = svgElement.childNodes[0];
      // The first <svg> child should be the <g id="cow"> element.
      expect(svgChild.tagName.toLowerCase()).toBe('g');
      expect(svgChild.getAttribute('id')).toBe('cow');
      verifyPathChildElement(svgChild, 'moo');
    });

    it('should allow multiple icon sets in a namespace', () => {
      addRemoteIconSetInNamespace(...[
        { namespace: 'farm', url: 'farm-set-1.svg', isTrusted: true },
        { namespace: 'farm', url: 'farm-set-2.svg', isTrusted: true },
        { namespace: 'arrows', url: 'arrow-set.svg', isTrusted: true }
      ]);

      let fixture = TestBed.createComponent(IconFromSvgName);

      const testComponent = fixture.componentInstance;
      const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
      let svgElement: any;
      let svgChild: any;

      testComponent.iconName = 'farm:pig';
      fixture.detectChanges();
      svgElement = verifyAndGetSingleSvgChild(mdIconElement);
      expect(svgElement.childNodes.length).toBe(1);
      svgChild = svgElement.childNodes[0];
      // The <svg> child should be the <g id="pig"> element.
      expect(svgChild.tagName.toLowerCase()).toBe('g');
      expect(svgChild.getAttribute('id')).toBe('pig');
      expect(svgChild.childNodes.length).toBe(1);
      verifyPathChildElement(svgChild, 'oink');

      // Both icon sets registered in the 'farm' namespace should have been fetched.
      expect(httpRequestUrls.sort()).toEqual(['farm-set-1.svg', 'farm-set-2.svg']);

      // Change the icon name to one that appears in both icon sets. The icon from the set that
      // was registered last should be used (with id attribute of 'moo moo' instead of 'moo'),
      // and no additional HTTP request should be made.
      testComponent.iconName = 'farm:cow';
      fixture.detectChanges();
      svgElement = verifyAndGetSingleSvgChild(mdIconElement);
      svgChild = svgElement.childNodes[0];
      // The first <svg> child should be the <g id="cow"> element.
      expect(svgChild.tagName.toLowerCase()).toBe('g');
      expect(svgChild.getAttribute('id')).toBe('cow');
      expect(svgChild.childNodes.length).toBe(1);
      verifyPathChildElement(svgChild, 'moo moo');
      expect(httpRequestUrls.sort()).toEqual(['farm-set-1.svg', 'farm-set-2.svg']);
    });

    it('should unwrap <symbol> nodes', () => {
      addRemoteIconSetInNamespace({ namespace: 'farm', url: 'farm-set-3.svg', isTrusted: true });

      const fixture = TestBed.createComponent(IconFromSvgName);
      const testComponent = fixture.componentInstance;
      const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');

      testComponent.iconName = 'farm:duck';
      fixture.detectChanges();

      const svgElement = verifyAndGetSingleSvgChild(mdIconElement);
      const firstChild = svgElement.childNodes[0];

      expect(svgElement.querySelector('symbol')).toBeFalsy();
      expect(svgElement.childNodes.length).toBe(1);
      expect(firstChild.nodeName.toLowerCase()).toBe('path');
      expect((firstChild as HTMLElement).getAttribute('id')).toBe('quack');
    });

    it('should not wrap <svg> elements in icon sets in another svg tag', () => {
      addRemoteIconSet({ url: 'arrow-set.svg', isTrusted: true });

      let fixture = TestBed.createComponent(IconFromSvgName);

      const testComponent = fixture.componentInstance;
      const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
      let svgElement: any;

      testComponent.iconName = 'left-arrow';
      fixture.detectChanges();
      // arrow-set.svg stores its icons as nested <svg> elements, so they should be used
      // directly and not wrapped in an outer <svg> tag like the <g> elements in other sets.
      svgElement = verifyAndGetSingleSvgChild(mdIconElement);
      verifyPathChildElement(svgElement, 'left');
    });

    it('should return unmodified copies of icons from icon sets', () => {
      addRemoteIconSet({ url: 'arrow-set.svg', isTrusted: true });

      let fixture = TestBed.createComponent(IconFromSvgName);

      const testComponent = fixture.componentInstance;
      const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
      let svgElement: any;

      testComponent.iconName = 'left-arrow';
      fixture.detectChanges();
      svgElement = verifyAndGetSingleSvgChild(mdIconElement);
      verifyPathChildElement(svgElement, 'left');
      // Modify the SVG element by setting a viewBox attribute.
      svgElement.setAttribute('viewBox', '0 0 100 100');

      // Switch to a different icon.
      testComponent.iconName = 'right-arrow';
      fixture.detectChanges();
      svgElement = verifyAndGetSingleSvgChild(mdIconElement);
      verifyPathChildElement(svgElement, 'right');

      // Switch back to the first icon. The viewBox attribute should not be present.
      testComponent.iconName = 'left-arrow';
      fixture.detectChanges();
      svgElement = verifyAndGetSingleSvgChild(mdIconElement);
      verifyPathChildElement(svgElement, 'left');
      expect(svgElement.getAttribute('viewBox')).toBeFalsy();
    });
  });

  describe('custom fonts', () => {
    it('should apply CSS classes for custom font and icon', () => {
      mdIconRegistry.registerFontClassAlias('f1', 'font1');
      mdIconRegistry.registerFontClassAlias('f2');

      let fixture = TestBed.createComponent(IconWithCustomFontCss);

      const testComponent = fixture.componentInstance;
      const mdIconElement = fixture.debugElement.nativeElement.querySelector('md-icon');
      testComponent.fontSet = 'f1';
      testComponent.fontIcon = 'house';
      fixture.detectChanges();
      expect(sortedClassNames(mdIconElement)).toEqual(['font1', 'house', 'mat-icon']);

      testComponent.fontSet = 'f2';
      testComponent.fontIcon = 'igloo';
      fixture.detectChanges();
      expect(sortedClassNames(mdIconElement)).toEqual(['f2', 'igloo', 'mat-icon']);

      testComponent.fontSet = 'f3';
      testComponent.fontIcon = 'tent';
      fixture.detectChanges();
      expect(sortedClassNames(mdIconElement)).toEqual(['f3', 'mat-icon', 'tent']);
    });
  });

  /** Marks an svg icon url as explicitly trusted. */
  function trust(iconUrl: string): SafeResourceUrl {
    return sanitizer.bypassSecurityTrustResourceUrl(iconUrl);
  }

  /** Mocks a request */
  function mockRequest(url: string) {
    // Keep track of requests so we can verify caching behavior.
    httpRequestUrls.push(url);
    // Return responses for the SVGs defined in fake-svgs.ts.
    let req = httpMock.expectOne(url);
    req.flush(getFakeSvgHttpResponse(url));
  }

  /** Mocks a request to get an svg icon */
  function addRemoteIcon(...icons: { name: string; url: string; isTrusted: boolean; }[]) {
    for (let icon of icons) {
      let { name, url, isTrusted = false } = icon;
      mdIconRegistry.addSvgIcon(name, isTrusted ? trust(url) : url);
      mockRequest(url);
    }
  }

  /** Mocks a request to get an svg icon set in namespace */
  function addRemoteIconSetInNamespace(
    ...icons: { namespace: string; url: string; isTrusted: boolean; }[]) {
    for (let icon of icons) {
      let { namespace, url, isTrusted = false } = icon;
      mdIconRegistry.addSvgIconSetInNamespace(namespace, isTrusted ? trust(url) : url);
      mockRequest(url);
    }
  }

  function addRemoteIconSet(...icons: { url: string; isTrusted: boolean; }[]) {
    for (let icon of icons) {
      let { url, isTrusted = false } = icon;
      mdIconRegistry.addSvgIconSet(isTrusted ? trust(url) : url);
      mockRequest(url);
    }
  }
});


describe('MdIcon without HttpClientModule', () => {
  let mdIconRegistry: MdIconRegistry;
  let sanitizer: DomSanitizer;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdIconModule],
      declarations: [IconFromSvgName],
    });

    TestBed.compileComponents();
  }));

  beforeEach(inject([MdIconRegistry, DomSanitizer], (mir: MdIconRegistry, ds: DomSanitizer) => {
    mdIconRegistry = mir;
    sanitizer = ds;
  }));

  it('should throw an error when trying to load a remote icon', async() => {
    const expectedError = wrappedErrorMessage(getMdIconNoHttpProviderError());

    expect(() => {
      mdIconRegistry.addSvgIcon('fido', sanitizer.bypassSecurityTrustResourceUrl('dog.svg'));

      let fixture = TestBed.createComponent(IconFromSvgName);

      fixture.componentInstance.iconName = 'fido';
      fixture.detectChanges();
    }).toThrowError(expectedError);
  });
});


@Component({template: `<md-icon>{{iconName}}</md-icon>`})
class IconWithLigature {
  iconName = '';
}

@Component({template: `<md-icon [color]="iconColor">{{iconName}}</md-icon>`})
class IconWithColor {
  iconName = '';
  iconColor = 'primary';
}

@Component({template: `<md-icon [fontSet]="fontSet" [fontIcon]="fontIcon"></md-icon>`})
class IconWithCustomFontCss {
  fontSet = '';
  fontIcon = '';
}

@Component({template: `<md-icon [svgIcon]="iconName"></md-icon>`})
class IconFromSvgName {
  iconName = '';
}

@Component({template: '<md-icon aria-hidden="false">face</md-icon>'})
class IconWithAriaHiddenFalse { }
