import {ListRange} from '@angular/cdk/collections';

export interface VirtualScrollRenderedRange {
  start: number | null;
  end: number | null;
}

export function expandRenderedRange(
  renderedRange: VirtualScrollRenderedRange,
  newRange: ListRange,
): ListRange {
  if (renderedRange.start === null) {
    renderedRange.start = newRange.start;
  }
  renderedRange.start = Math.min(renderedRange.start, newRange.start);

  if (renderedRange.end === null) {
    renderedRange.end = newRange.end;
  }
  renderedRange.end = Math.max(renderedRange.end, newRange.end);

  return {
    start: renderedRange.start,
    end: renderedRange.end,
  };
}
