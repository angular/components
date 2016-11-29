import {Injectable, NgModule, ModuleWithProviders} from '@angular/core';

declare const window: any;

// Whether the current platform supports the V8 Break Iterator. The V8 check
// is necessary to detect all Blink based browsers.
const hasV8BreakIterator = (window.Intl && (window.Intl as any).v8BreakIterator);

/**
 * Service to detect the current platform by comparing the userAgent strings and
 * checking browser-specific global properties.
 */
@Injectable()
export class MdPlatform {

  /** Layout Engines */
  EDGE = /(edge)/i.test(navigator.userAgent);
  TRIDENT = /(msie|trident)/i.test(navigator.userAgent);

  // EdgeHTML and Trident mock Blink specific things and need to excluded from this check.
  BLINK = !!(window.chrome || hasV8BreakIterator) && !!CSS && !this.EDGE && !this.TRIDENT;

  // Webkit is part of the userAgent in EdgeHTML Blink and Trident, so we need to
  // ensure that Webkit runs standalone and is not use as another engines base.
  WEBKIT = /AppleWebKit/i.test(navigator.userAgent) && !this.BLINK && !this.EDGE && !this.TRIDENT;

  /** Browsers and Platform Types */
  IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  FIREFOX = /(firefox|minefield)/i.test(navigator.userAgent);

  // Trident on mobile adds the android platform to the userAgent to trick detections.
  ANDROID = /android/i.test(navigator.userAgent) && !this.TRIDENT;

}

@NgModule({})
export class PlatformModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: PlatformModule,
      providers: [MdPlatform],
    };
  }
}
