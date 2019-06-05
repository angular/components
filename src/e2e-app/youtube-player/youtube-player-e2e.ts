import {ChangeDetectorRef, Component} from '@angular/core';

declare global {
  interface Window {
    YT: typeof YT | undefined;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface Video {
  id: string;
  name: string;
}

const VIDEOS: Video[] = [
  {
    id: 'PRQCAL_RMVo',
    name: 'Instructional',
  },
  {
    id: 'O0xx5SvjmnU',
    name: 'Angular Conf',
  },
  {
    id: 'invalidname',
    name: 'Invalid',
  },
];

@Component({
  moduleId: module.id,
  selector: 'youtube-player-e2e',
  templateUrl: 'youtube-player-e2e.html',
})
export class YouTubePlayerE2E {
  video: Video | undefined = VIDEOS[0];
  videos = VIDEOS;
  apiLoaded = false;

  constructor(private _ref: ChangeDetectorRef) {
    if (window.YT) {
      this.apiLoaded = true;
      return;
    }

    window.onYouTubeIframeAPIReady = () => {
      this.apiLoaded = true;
      this._ref.detectChanges();
    };
  }
}
