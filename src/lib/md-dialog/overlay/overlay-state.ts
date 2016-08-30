import {PositionStrategy} from './position/position-strategy';

/**
 * OverlayState is a bag of values for either the initial configuration or current state of an
 * overlay.
 */
export class OverlayState {
  /** Strategy with which to position the overlay. */
  positionStrategy: PositionStrategy;
}
