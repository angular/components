/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatRadioModule} from '@angular/material/radio';
import {YouTubePlayerModule} from '@angular/youtube-player';
import {MatCheckboxModule} from '@angular/material/checkbox';

interface Video {
  id: string;
  name: string;
  isPlaylist?: boolean;
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
  {
    id: 'PLOa5YIicjJ-XCGXwnEmMmpHHCn11gUgvL',
    name: 'Angular Forms Playlist',
    isPlaylist: true,
  },
  {
    id: 'PLOa5YIicjJ-VpOOoLczAGTLEEznZ2JEa6',
    name: 'Angular Router Playlist',
    isPlaylist: true,
  },
];

@Component({
  selector: 'youtube-player-demo',
  templateUrl: 'youtube-player-demo.html',
  styleUrls: ['youtube-player-demo.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatRadioModule, MatCheckboxModule, YouTubePlayerModule],
})
export class YouTubePlayerDemo implements AfterViewInit, OnDestroy {
  @ViewChild('demoYouTubePlayer') demoYouTubePlayer: ElementRef<HTMLDivElement>;
  private _selectedVideo?: Video;
  private _playerVars?: YT.PlayerVars;
  private _selectedVideoId?: string;

  videos = VIDEOS;
  videoWidth: number | undefined;
  videoHeight: number | undefined;
  disableCookies = false;

  constructor(private _changeDetectorRef: ChangeDetectorRef) {
    this._loadApi();

    this.selectedVideo = VIDEOS[0];
  }

  ngAfterViewInit(): void {
    this.onResize();
    window.addEventListener('resize', this.onResize);
  }

  onResize = (): void => {
    // Automatically expand the video to fit the page up to 1200px x 720px
    this.videoWidth = Math.min(this.demoYouTubePlayer.nativeElement.clientWidth, 1200);
    this.videoHeight = this.videoWidth * 0.6;
    this._changeDetectorRef.detectChanges();
  };

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize);
  }

  get selectedVideoId() {
    return this._selectedVideoId;
  }

  get playerVars() {
    return this._playerVars;
  }

  get selectedVideo() {
    return this._selectedVideo;
  }

  set selectedVideo(value: Video | undefined) {
    this._selectedVideo = value;

    // If the video is a playlist, don't send a video id, and prepare playerVars instead

    if (!value?.isPlaylist) {
      this._playerVars = undefined;
      this._selectedVideoId = value?.id;
      return;
    }

    this._playerVars = {
      list: this._selectedVideo?.id,
      listType: 'playlist',
    };

    this._selectedVideoId = undefined;
  }

  private _loadApi() {
    if (!window.YT) {
      // We don't need to wait for the API to load since the
      // component is set up to wait for it automatically.
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(script);
    }
  }
}
