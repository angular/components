/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';
import {PlaceholderImageQuality, YouTubePlayer} from '@angular/youtube-player';

interface Video {
  id: string;
  name: string;
  isPlaylist?: boolean;
  autoplay?: boolean;
  placeholderQuality: PlaceholderImageQuality;
}

const VIDEOS: Video[] = [
  {
    id: 'hsUxJjY-PRg',
    name: 'Control Flow',
    placeholderQuality: 'high',
  },
  {
    id: 'O0xx5SvjmnU',
    name: 'Angular Conf',
    placeholderQuality: 'high',
  },
  {
    id: 'invalidname',
    name: 'Invalid',
    placeholderQuality: 'high',
  },
  {
    id: 'PLOa5YIicjJ-XCGXwnEmMmpHHCn11gUgvL',
    name: 'Angular Forms Playlist',
    isPlaylist: true,
    placeholderQuality: 'high',
  },
  {
    id: 'PLOa5YIicjJ-VpOOoLczAGTLEEznZ2JEa6',
    name: 'Angular Router Playlist',
    isPlaylist: true,
    placeholderQuality: 'high',
  },
  {
    id: 'PXNp4LENMPA',
    name: 'Angular.dev (autoplay)',
    autoplay: true,
    placeholderQuality: 'high',
  },
  {
    id: 'txqiwrbYGrs',
    name: 'David after dentist (only standard quality placeholder)',
    placeholderQuality: 'low',
  },
  {
    id: 'EwTZ2xpQwpA',
    name: 'Chocolate rain (only low quality placeholder)',
    placeholderQuality: 'low',
  },
];

@Component({
  selector: 'youtube-player-demo',
  templateUrl: 'youtube-player-demo.html',
  styleUrl: 'youtube-player-demo.css',
  imports: [FormsModule, MatRadioModule, MatCheckboxModule, YouTubePlayer],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YouTubePlayerDemo implements AfterViewInit, OnDestroy {
  @ViewChild('demoYouTubePlayer') demoYouTubePlayer: ElementRef<HTMLDivElement>;
  private _selectedVideo?: Video;
  private _playerVars?: YT.PlayerVars;
  private _selectedVideoId?: string;
  private _changeDetectorRef = inject(ChangeDetectorRef);

  videos = VIDEOS;
  videoWidth: number | undefined;
  videoHeight: number | undefined;
  disableCookies = false;
  disablePlaceholder = false;
  placeholderQuality: PlaceholderImageQuality;

  constructor() {
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
    this._changeDetectorRef.markForCheck();
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
    this.placeholderQuality = value?.placeholderQuality || 'standard';

    // If the video is a playlist, don't send a video id, and prepare playerVars instead

    if (!value?.isPlaylist) {
      this._playerVars = value?.autoplay ? {autoplay: 1} : undefined;
      this._selectedVideoId = value?.id;
      return;
    }

    this._playerVars = {
      list: this._selectedVideo?.id,
      listType: 'playlist',
    };

    this._selectedVideoId = undefined;
  }
}
