# Angular YouTube Player component

This component provides a simple angular wrapper around the embed [YouTube player API](https://developers.google.com/youtube/iframe_api_reference). File any bugs against the [angular/components repo](https://github.com/angular/components/issues).

## Installation

To install, run `npm install @angular/youtube-player`.

## Usage

Follow the following instructions for setting up the YouTube player component:

- First, follow the [instructions for installing the API script](https://developers.google.com/youtube/iframe_api_reference#Getting_Started).
- Then make sure the API is available before bootstraping the YouTube Player component.
- Provide the video id by extracting it from the video URL.

## Example

If your video is found at https://www.youtube.com/watch?v=PRQCAL_RMVo, then your video id is `PRQCAL_RMVo`.

```typescript
// example-module.ts
import {NgModule, Component} from '@angular/core';
import {
  YouTubePlayerModule,
  YOUTUBE_PLAYER_CONFIG,
  YouTubePlayerConfig,
} from '@angular/youtube-player';

@NgModule({
  imports: [YouTubePlayerModule],
  // Optionally tells the `youtube-player` component to automatically load
  // the YouTube iframe API. Omit this if you plan to load the API yourself.
  providers: [{
    provide: YOUTUBE_PLAYER_CONFIG,
    useValue: {
      loadApi: true
    } as YouTubePlayerConfig
  }]
  declarations: [YoutubePlayerExample],
})
export class YoutubePlayerExampleModule {
}

// example-component.ts
@Component({
  template: '<youtube-player videoId="PRQCAL_RMVo"></youtube-player>',
  selector: 'youtube-player-example',
})
class YoutubePlayerExample {}
```

## API

Check out the [source](./youtube-player.ts) to read the API.
