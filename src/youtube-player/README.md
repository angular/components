# Angular YouTube Player component

This component provides a simple Angular wrapper around the
[YouTube player API](https://developers.google.com/youtube/iframe_api_reference).
File any bugs against the [angular/components repo](https://github.com/angular/components/issues).

## Installation
To install, run `npm install @angular/youtube-player`.

## Usage
Import the component either by adding the `YouTubePlayerModule` to your app or  by importing
`YouTubePlayer` into a standalone component. Then add the `<yotube-player videoId="<your ID>"`
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
