/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/1265
/// <reference types="youtube" />

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  Output,
  ViewChild,
  ViewEncapsulation,
  Inject,
  PLATFORM_ID,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {Observable, of as observableOf, Subject, BehaviorSubject, fromEventPattern} from 'rxjs';
import {takeUntil, switchMap} from 'rxjs/operators';

declare global {
  interface Window {
    YT: typeof YT | undefined;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

export const DEFAULT_PLAYER_WIDTH = 640;
export const DEFAULT_PLAYER_HEIGHT = 390;

/**
 * Object used to store the state of the player if the
 * user tries to interact with the API before it has been loaded.
 */
interface PendingPlayerState {
  playbackState?: YT.PlayerState.PLAYING | YT.PlayerState.PAUSED | YT.PlayerState.CUED;
  playbackRate?: number;
  volume?: number;
  muted?: boolean;
  seek?: {seconds: number; allowSeekAhead: boolean};
}

/**
 * Angular component that renders a YouTube player via the YouTube player
 * iframe API.
 * @see https://developers.google.com/youtube/iframe_api_reference
 */
@Component({
  selector: 'youtube-player',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  // This div is *replaced* by the YouTube player embed.
  template: '<div #youtubeContainer></div>',
})
export class YouTubePlayer implements AfterViewInit, OnChanges, OnDestroy {
  /** Whether we're currently rendering inside a browser. */
  private readonly _isBrowser: boolean;
  private _player: YT.Player | undefined;
  private _pendingPlayer: YT.Player | undefined;
  private _existingApiReadyCallback: (() => void) | undefined;
  private _pendingPlayerState: PendingPlayerState | undefined;
  private readonly _destroyed = new Subject<void>();
  private readonly _playerChanges = new BehaviorSubject<YT.Player | undefined>(undefined);

  /** YouTube Video ID to view */
  @Input()
  videoId: string | undefined;

  /** Height of video player */
  @Input()
  get height(): number {
    return this._height;
  }
  set height(height: number | undefined) {
    this._height = height || DEFAULT_PLAYER_HEIGHT;
  }
  private _height = DEFAULT_PLAYER_HEIGHT;

  /** Width of video player */
  @Input()
  get width(): number {
    return this._width;
  }
  set width(width: number | undefined) {
    this._width = width || DEFAULT_PLAYER_WIDTH;
  }
  private _width = DEFAULT_PLAYER_WIDTH;

  /** The moment when the player is supposed to start playing */
  @Input()
  startSeconds: number | undefined;

  /** The moment when the player is supposed to stop playing */
  @Input()
  endSeconds: number | undefined;

  /** The suggested quality of the player */
  @Input()
  suggestedQuality: YT.SuggestedVideoQuality | undefined;

  /**
   * Extra parameters used to configure the player. See:
   * https://developers.google.com/youtube/player_parameters.html?playerVersion=HTML5#Parameters
   */
  @Input()
  playerVars: YT.PlayerVars | undefined;

  /** Whether cookies inside the player have been disabled. */
  @Input()
  disableCookies: boolean = false;

  /**
   * Whether the iframe will attempt to load regardless of the status of the api on the
   * page. Set this to true if you don't want the `onYouTubeIframeAPIReady` field to be
   * set on the global window.
   */
  @Input() showBeforeIframeApiLoads: boolean | undefined;

  /** Outputs are direct proxies from the player itself. */
  @Output() readonly ready: Observable<YT.PlayerEvent> =
    this._getLazyEmitter<YT.PlayerEvent>('onReady');

  @Output() readonly stateChange: Observable<YT.OnStateChangeEvent> =
    this._getLazyEmitter<YT.OnStateChangeEvent>('onStateChange');

  @Output() readonly error: Observable<YT.OnErrorEvent> =
    this._getLazyEmitter<YT.OnErrorEvent>('onError');

  @Output() readonly apiChange: Observable<YT.PlayerEvent> =
    this._getLazyEmitter<YT.PlayerEvent>('onApiChange');

  @Output() readonly playbackQualityChange: Observable<YT.OnPlaybackQualityChangeEvent> =
    this._getLazyEmitter<YT.OnPlaybackQualityChangeEvent>('onPlaybackQualityChange');

  @Output() readonly playbackRateChange: Observable<YT.OnPlaybackRateChangeEvent> =
    this._getLazyEmitter<YT.OnPlaybackRateChangeEvent>('onPlaybackRateChange');

  /** The element that will be replaced by the iframe. */
  @ViewChild('youtubeContainer', {static: true})
  youtubeContainer: ElementRef<HTMLElement>;

  constructor(
    private _ngZone: NgZone,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this._isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit() {
    // Don't do anything if we're not in a browser environment.
    if (!this._isBrowser) {
      return;
    }

    if (!window.YT || !window.YT.Player) {
      if (this.showBeforeIframeApiLoads && (typeof ngDevMode === 'undefined' || ngDevMode)) {
        throw new Error(
          'Namespace YT not found, cannot construct embedded youtube player. ' +
            'Please install the YouTube Player API Reference for iframe Embeds: ' +
            'https://developers.google.com/youtube/iframe_api_reference',
        );
      }

      this._existingApiReadyCallback = window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady = () => {
        this._existingApiReadyCallback?.();
        this._ngZone.run(() => this._createPlayer());
      };
    } else {
      this._createPlayer();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this._shouldRecreatePlayer(changes)) {
      this._createPlayer();
    } else if (this._player) {
      if (changes['width'] || changes['height']) {
        this._setSize();
      }

      if (changes['suggestedQuality']) {
        this._setQuality();
      }

      if (changes['startSeconds'] || changes['endSeconds'] || changes['suggestedQuality']) {
        this._cuePlayer();
      }
    }
  }

  ngOnDestroy() {
    this._pendingPlayer?.destroy();

    if (this._player) {
      this._player.destroy();
      window.onYouTubeIframeAPIReady = this._existingApiReadyCallback;
    }

    this._playerChanges.complete();
    this._destroyed.next();
    this._destroyed.complete();
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#playVideo */
  playVideo() {
    if (this._player) {
      this._player.playVideo();
    } else {
      this._getPendingState().playbackState = YT.PlayerState.PLAYING;
    }
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#pauseVideo */
  pauseVideo() {
    if (this._player) {
      this._player.pauseVideo();
    } else {
      this._getPendingState().playbackState = YT.PlayerState.PAUSED;
    }
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#stopVideo */
  stopVideo() {
    if (this._player) {
      this._player.stopVideo();
    } else {
      // It seems like YouTube sets the player to CUED when it's stopped.
      this._getPendingState().playbackState = YT.PlayerState.CUED;
    }
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#seekTo */
  seekTo(seconds: number, allowSeekAhead: boolean) {
    if (this._player) {
      this._player.seekTo(seconds, allowSeekAhead);
    } else {
      this._getPendingState().seek = {seconds, allowSeekAhead};
    }
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#mute */
  mute() {
    if (this._player) {
      this._player.mute();
    } else {
      this._getPendingState().muted = true;
    }
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#unMute */
  unMute() {
    if (this._player) {
      this._player.unMute();
    } else {
      this._getPendingState().muted = false;
    }
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#isMuted */
  isMuted(): boolean {
    if (this._player) {
      return this._player.isMuted();
    }

    if (this._pendingPlayerState) {
      return !!this._pendingPlayerState.muted;
    }

    return false;
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#setVolume */
  setVolume(volume: number) {
    if (this._player) {
      this._player.setVolume(volume);
    } else {
      this._getPendingState().volume = volume;
    }
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getVolume */
  getVolume(): number {
    if (this._player) {
      return this._player.getVolume();
    }

    if (this._pendingPlayerState && this._pendingPlayerState.volume != null) {
      return this._pendingPlayerState.volume;
    }

    return 0;
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#setPlaybackRate */
  setPlaybackRate(playbackRate: number) {
    if (this._player) {
      return this._player.setPlaybackRate(playbackRate);
    } else {
      this._getPendingState().playbackRate = playbackRate;
    }
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getPlaybackRate */
  getPlaybackRate(): number {
    if (this._player) {
      return this._player.getPlaybackRate();
    }

    if (this._pendingPlayerState && this._pendingPlayerState.playbackRate != null) {
      return this._pendingPlayerState.playbackRate;
    }

    return 0;
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getAvailablePlaybackRates */
  getAvailablePlaybackRates(): number[] {
    return this._player ? this._player.getAvailablePlaybackRates() : [];
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getVideoLoadedFraction */
  getVideoLoadedFraction(): number {
    return this._player ? this._player.getVideoLoadedFraction() : 0;
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getPlayerState */
  getPlayerState(): YT.PlayerState | undefined {
    if (!this._isBrowser || !window.YT) {
      return undefined;
    }

    if (this._player) {
      return this._player.getPlayerState();
    }

    if (this._pendingPlayerState && this._pendingPlayerState.playbackState != null) {
      return this._pendingPlayerState.playbackState;
    }

    return YT.PlayerState.UNSTARTED;
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getCurrentTime */
  getCurrentTime(): number {
    if (this._player) {
      return this._player.getCurrentTime();
    }

    if (this._pendingPlayerState && this._pendingPlayerState.seek) {
      return this._pendingPlayerState.seek.seconds;
    }

    return 0;
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getPlaybackQuality */
  getPlaybackQuality(): YT.SuggestedVideoQuality {
    return this._player ? this._player.getPlaybackQuality() : 'default';
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getAvailableQualityLevels */
  getAvailableQualityLevels(): YT.SuggestedVideoQuality[] {
    return this._player ? this._player.getAvailableQualityLevels() : [];
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getDuration */
  getDuration(): number {
    return this._player ? this._player.getDuration() : 0;
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getVideoUrl */
  getVideoUrl(): string {
    return this._player ? this._player.getVideoUrl() : '';
  }

  /** See https://developers.google.com/youtube/iframe_api_reference#getVideoEmbedCode */
  getVideoEmbedCode(): string {
    return this._player ? this._player.getVideoEmbedCode() : '';
  }

  /** Gets an object that should be used to store the temporary API state. */
  private _getPendingState(): PendingPlayerState {
    if (!this._pendingPlayerState) {
      this._pendingPlayerState = {};
    }

    return this._pendingPlayerState;
  }

  /**
   * Determines whether a change in the component state
   * requires the YouTube player to be recreated.
   */
  private _shouldRecreatePlayer(changes: SimpleChanges): boolean {
    const change = changes['videoId'] || changes['playerVars'] || changes['disableCookies'];
    return !!change && !change.isFirstChange();
  }

  /** Creates a new YouTube player and destroys the existing one. */
  private _createPlayer() {
    this._player?.destroy();
    this._pendingPlayer?.destroy();

    // A player can't be created if the API isn't loaded,
    // or there isn't a video or playlist to be played.
    if (typeof YT === 'undefined' || (!this.videoId && !this.playerVars?.list)) {
      return;
    }

    // Important! We need to create the Player object outside of the `NgZone`, because it kicks
    // off a 250ms setInterval which will continually trigger change detection if we don't.
    const player = this._ngZone.runOutsideAngular(
      () =>
        new YT.Player(this.youtubeContainer.nativeElement, {
          videoId: this.videoId,
          host: this.disableCookies ? 'https://www.youtube-nocookie.com' : undefined,
          width: this.width,
          height: this.height,
          playerVars: this.playerVars,
        }),
    );

    const whenReady = () => {
      // Only assign the player once it's ready, otherwise YouTube doesn't expose some APIs.
      this._player = player;
      this._pendingPlayer = undefined;
      player.removeEventListener('onReady', whenReady);
      this._playerChanges.next(player);
      this._setSize();
      this._setQuality();

      if (this._pendingPlayerState) {
        this._applyPendingPlayerState(player, this._pendingPlayerState);
        this._pendingPlayerState = undefined;
      }

      // Only cue the player when it either hasn't started yet or it's cued,
      // otherwise cuing it can interrupt a player with autoplay enabled.
      const state = player.getPlayerState();
      if (state === YT.PlayerState.UNSTARTED || state === YT.PlayerState.CUED || state == null) {
        this._cuePlayer();
      }
    };

    this._pendingPlayer = player;
    player.addEventListener('onReady', whenReady);
  }

  /** Applies any state that changed before the player was initialized. */
  private _applyPendingPlayerState(player: YT.Player, pendingState: PendingPlayerState): void {
    const {playbackState, playbackRate, volume, muted, seek} = pendingState;

    switch (playbackState) {
      case YT.PlayerState.PLAYING:
        player.playVideo();
        break;
      case YT.PlayerState.PAUSED:
        player.pauseVideo();
        break;
      case YT.PlayerState.CUED:
        player.stopVideo();
        break;
    }

    if (playbackRate != null) {
      player.setPlaybackRate(playbackRate);
    }

    if (volume != null) {
      player.setVolume(volume);
    }

    if (muted != null) {
      muted ? player.mute() : player.unMute();
    }

    if (seek != null) {
      player.seekTo(seek.seconds, seek.allowSeekAhead);
    }
  }

  /** Cues the player based on the current component state. */
  private _cuePlayer() {
    if (this._player && this.videoId) {
      this._player.cueVideoById({
        videoId: this.videoId,
        startSeconds: this.startSeconds,
        endSeconds: this.endSeconds,
        suggestedQuality: this.suggestedQuality,
      });
    }
  }

  /** Sets the player's size based on the current input values. */
  private _setSize() {
    this._player?.setSize(this.width, this.height);
  }

  /** Sets the player's quality based on the current input values. */
  private _setQuality() {
    if (this._player && this.suggestedQuality) {
      this._player.setPlaybackQuality(this.suggestedQuality);
    }
  }

  /** Gets an observable that adds an event listener to the player when a user subscribes to it. */
  private _getLazyEmitter<T extends YT.PlayerEvent>(name: keyof YT.Events): Observable<T> {
    // Start with the stream of players. This way the events will be transferred
    // over to the new player if it gets swapped out under-the-hood.
    return this._playerChanges.pipe(
      // Switch to the bound event. `switchMap` ensures that the old event is removed when the
      // player is changed. If there's no player, return an observable that never emits.
      switchMap(player => {
        return player
          ? fromEventPattern<T>(
              (listener: (event: T) => void) => {
                player.addEventListener(name, listener);
              },
              (listener: (event: T) => void) => {
                // The API seems to throw when we try to unbind from a destroyed player and it doesn't
                // expose whether the player has been destroyed so we have to wrap it in a try/catch to
                // prevent the entire stream from erroring out.
                try {
                  player?.removeEventListener?.(name, listener);
                } catch {}
              },
            )
          : observableOf<T>();
      }),
      // By default we run all the API interactions outside the zone
      // so we have to bring the events back in manually when they emit.
      source =>
        new Observable<T>(observer =>
          source.subscribe({
            next: value => this._ngZone.run(() => observer.next(value)),
            error: error => observer.error(error),
            complete: () => observer.complete(),
          }),
        ),
      // Ensures that everything is cleared out on destroy.
      takeUntil(this._destroyed),
    );
  }
}
