/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, ViewEncapsulation, computed, input} from '@angular/core';

/**  Quality of the placeholder image.  */
export type PlaceholderImageQuality = 'high' | 'standard' | 'low';

const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]+$/;

@Component({
  selector: 'youtube-player-placeholder',
  encapsulation: ViewEncapsulation.None,
  template: `
    <button type="button" class="youtube-player-placeholder-button" [attr.aria-label]="buttonLabel()">
      <svg
        height="100%"
        version="1.1"
        viewBox="0 0 68 48"
        focusable="false"
        aria-hidden="true">
        <path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path>
        <path d="M 45,24 27,14 27,34" fill="#fff"></path>
      </svg>
    </button>
  `,
  styleUrl: 'youtube-player-placeholder.css',
  host: {
    'class': 'youtube-player-placeholder',
    '[class.youtube-player-placeholder-loading]': 'isLoading()',
    '[style.background-image]': '_backgroundImage()',
    '[style.width.px]': 'width()',
    '[style.height.px]': 'height()',
  },
})
export class YouTubePlayerPlaceholder {
  /** ID of the video for which to show the placeholder. */
  readonly videoId = input.required<string>();

  /** Width of the video for which to show the placeholder. */
  readonly width = input.required<number>();

  /** Height of the video for which to show the placeholder. */
  readonly height = input.required<number>();

  /** Whether the video is currently being loaded. */
  readonly isLoading = input.required<boolean>();

  /** Accessible label for the play button. */
  readonly buttonLabel = input.required<string>();

  /** Quality of the placeholder image. */
  readonly quality = input.required<PlaceholderImageQuality>();

  /** Gets the background image showing the placeholder. */
  protected _backgroundImage = computed(() => {
    const quality = this.quality();
    const videoId = this.videoId();

    // Since we're interpolating the ID into a CSS value, we need
    // to ensure that it doesn't become an XSS attack vector.
    if (!VIDEO_ID_REGEX.test(videoId)) {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        console.error(
          `Skipping placeholder image generation for invalid YouTube video ID: ${videoId}`,
        );
      }
      return null;
    }

    let url: string;

    if (quality === 'low') {
      url = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    } else if (quality === 'high') {
      url = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    } else {
      url = `https://i.ytimg.com/vi_webp/${videoId}/sddefault.webp`;
    }

    return `url(${url})`;
  });
}
