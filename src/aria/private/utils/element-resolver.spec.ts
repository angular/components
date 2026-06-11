import {ElementRef} from '@angular/core';
import {resolveElement} from './element-resolver';

describe('ElementResolver', () => {
  let context: HTMLElement;

  beforeEach(() => {
    context = document.createElement('div');
    context.id = 'context-host';
  });

  describe('resolveElement', () => {
    it('should resolve a direct DOM element', () => {
      const target = document.createElement('span');
      expect(resolveElement(target, context)).toBe(target);
    });

    it('should resolve an ElementRef transparently', () => {
      const target = document.createElement('span');
      const elementRef = new ElementRef(target);
      expect(resolveElement(elementRef, context)).toBe(target);
    });

    it('should resolve null as undefined', () => {
      expect(resolveElement(null, context)).toBeUndefined();
    });

    it('should resolve undefined as undefined', () => {
      expect(resolveElement(undefined, context)).toBeUndefined();
    });

    it('should evaluate a resolution function', () => {
      const target = document.createElement('span');
      const resolver = (ctx: HTMLElement) => {
        expect(ctx).toBe(context);
        return target;
      };
      expect(resolveElement(resolver, context)).toBe(target);
    });

    it('should evaluate a resolution function returning null', () => {
      const resolver = () => null;
      expect(resolveElement(resolver, context)).toBeUndefined();
    });

    it('should evaluate a resolution function returning undefined', () => {
      const resolver = () => undefined;
      expect(resolveElement(resolver, context)).toBeUndefined();
    });
  });
});
