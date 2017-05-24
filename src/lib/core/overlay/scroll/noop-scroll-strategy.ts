import {Injectable} from '@angular/core';
import {ScrollStrategy} from './scroll-strategy';

/**
 * Scroll strategy that doesn't do anything.
 */
@Injectable()
export class NoopScrollStrategy implements ScrollStrategy {
  enable() { }
  disable() { }
  attach() { }
}
