import {
  coerceToString,
  coerceToNumber,
} from './grid-list-measure';

export class MediaConfig {

}
export const MEDIA = {
    'xs'        : '(max-width: 599px)'                         ,
    'gt-xs'     : '(min-width: 600px)'                         ,
    'sm'        : '(min-width: 600px) and (max-width: 959px)'  ,
    'gt-sm'     : '(min-width: 960px)'                         ,
    'md'        : '(min-width: 960px) and (max-width: 1279px)' ,
    'gt-md'     : '(min-width: 1280px)'                        ,
    'lg'        : '(min-width: 1280px) and (max-width: 1919px)',
    'gt-lg'     : '(min-width: 1920px)'                        ,
    'xl'        : '(min-width: 1920px)'                        ,
    'landscape' : '(orientation: landscape)'                   ,
    'portrait'  : '(orientation: portrait)'                    ,
    'print' : 'print'
};

export const MEDIA_PRIORITY = [
  'xl',
  'gt-lg',
  'lg',
  'gt-md',
  'md',
  'gt-sm',
  'sm',
  'gt-xs',
  'xs',
  'landscape',
  'portrait',
  'print'
];

/**
 * Find the appropriate value to use for current matchMedia
 */
export function matchedMedia(value: {}, defaultValue: number | string) {
  for (let media of MEDIA_PRIORITY) {
    if (window.matchMedia(MEDIA[media]).matches && value[media]) {
      return value[media];
    }
  }
  return defaultValue;
}

/**
 * Process responsive values, make sure the returned value only contains keys and values for valid
 * media. The value can be number or string.
 */
export function processResponsiveValues(mediaValues: {}, isNumber: boolean = true) {
  let result = {};
  for (let media of MEDIA_PRIORITY) {
    if (mediaValues[media]) {
      result[media] =
        isNumber ? coerceToNumber(mediaValues[media]) : coerceToString(mediaValues[media]);
    }
  }
  return result;
}
