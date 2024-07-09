# Angular YouTube Player component

This component provides a simple Angular wrapper around the
[YouTube player API](https://developers.google.com/youtube/iframe_api_reference).
File any bugs against the [angular/components repo](https://github.com/angular/components/issues).

## Installation
To install, run `ng add @angular/youtube-player`.

## Usage
Import the component either by adding the `YouTubePlayerModule` to your app or by importing
`YouTubePlayer` into a standalone component. Then add the `<youtube-player videoId="<your ID>"`
to your template.

## Example
If your video is found at https://www.youtube.com/watch?v=mVjYG9TSN88, then your video id is `mVjYG9TSN88`.

```typescript
import {Component} from '@angular/core';
import {YouTubePlayer} from '@angular/youtube-player';

@Component({
  standalone: true,
  imports: [YouTubePlayer],
  template: '<youtube-player videoId="mVjYG9TSN88"/>',
  selector: 'youtube-player-example',
})
export class YoutubePlayerExample {}
```

## API reference
Check out the [source](./youtube-player.ts) to read the API.

## YouTube iframe API usage
The `<youtube-player/>` component requires the YouTube `iframe` to work. If the API isn't loaded
by the time the player is initialized, it'll load the API automatically from `https://www.youtube.com/iframe_api`.
If you don't want it to be loaded, you can either control it on a per-component level using the
`loadApi` input:

```html
<youtube-player videoId="mVjYG9TSN88" loadApi="false"/>
```

Or at a global level using the `YOUTUBE_PLAYER_CONFIG` injection token:

```typescript
import {NgModule} from '@angular/core';
import {YouTubePlayer, YOUTUBE_PLAYER_CONFIG} from '@angular/youtube-player';

@NgModule({
  imports: [YouTubePlayer],
  providers: [{
    provide: YOUTUBE_PLAYER_CONFIG,
    useValue: {
      loadApi: false
    }
  }]
})
export class YourApp {}
```

## Loading behavior
By default, the `<youtube-player/>` will show a placeholder element instead of loading the API
up-front until the user interacts with it. This speeds up the initial render of the page by not
loading unnecessary JavaScript for a video that might not be played. Once the user clicks on the
video, the API will be loaded and the placeholder will be swapped out with the actual video.

Note that the placeholder won't be shown in the following scenarios:
* Video that plays automatically (e.g. `playerVars` contains `autoplay: 1`).
* The player is showing a playlist (e.g. `playerVars` contains a `list` property).

If you want to disable the placeholder and have the `<youtube-player/>` load the API on
initialization, you can either pass in the `disablePlaceholder` input:

```html
<youtube-player videoId="mVjYG9TSN88" disablePlaceholder/>
```

Or set it at a global level using the `YOUTUBE_PLAYER_CONFIG` injection token:

```typescript
import {NgModule} from '@angular/core';
import {YouTubePlayer, YOUTUBE_PLAYER_CONFIG} from '@angular/youtube-player';

@NgModule({
  imports: [YouTubePlayer],
  providers: [{
    provide: YOUTUBE_PLAYER_CONFIG,
    useValue: {
      disablePlaceholder: true
    }
  }]
})
export class YourApp {}
```

### Placeholder image quality
YouTube provides different sizes of placeholder images depending on when the video was uploaded
and the thumbnail that was provided by the uploader. The `<youtube-player/>` defaults to a quality
that should be available for the majority of videos, but if you're seeing a grey placeholder,
consider switching to the `low` quality using the `placeholderImageQuality` input or through the
`YOUTUBE_PLAYER_CONFIG`.

```html
<!-- Default value, should exist for most videos. -->
<youtube-player videoId="mVjYG9TSN88" placeholderImageQuality="standard"/>

<!-- High quality image that should be present for most videos from the past few years. -->
<youtube-player videoId="mVjYG9TSN88" placeholderImageQuality="high"/>

<!-- Very low quality image, but should exist for all videos. -->
<youtube-player videoId="mVjYG9TSN88" placeholderImageQuality="low"/>
```

### Placeholder internationalization
Since the placeholder has an interactive `button` element, it needs an `aria-label` for proper
accessibility. The default label is "Play video", but you can customize it based on your app through
the  `placeholderButtonLabel` input or the `YOUTUBE_PLAYER_CONFIG` injection token:

```html
<youtube-player videoId="mVjYG9TSN88" placeholderButtonLabel="Afspil video"/>
```

### Placeholder caveats
There are a couple of considerations when using placeholders:
1. Different videos support different sizes of placeholder images and there's no way to know
ahead of time which one is supported. The `<youtube-player/>` defaults to a value that should
work for most videos, but if you want something higher or lower, you can refer to the
["Placeholder image quality" section](#placeholder-image-quality).
2. Unlike the native YouTube placeholder, the Angular component doesn't show the video's title,
because it isn't known ahead of time.
