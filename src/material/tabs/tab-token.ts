import {InjectionToken} from '@angular/core';

/**
 * Used to provide a tab without causing a circular dependency.
 * @docs-private
 */
export interface MatTabBase {}

/**
 * Used to provide a tab without causing a circular dependency.
 * @docs-private
 */
export const MAT_TAB = new InjectionToken<MatTabBase>('MAT_TAB');
