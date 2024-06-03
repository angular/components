import {Component, EnvironmentProviders, Provider, ViewChild} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {Subscription} from 'rxjs';
import {createFakeYtNamespace} from './fake-youtube-player';
import {
  DEFAULT_PLAYER_HEIGHT,
  DEFAULT_PLAYER_WIDTH,
  YOUTUBE_PLAYER_CONFIG,
  YouTubePlayer,
} from './youtube-player';
import {PlaceholderImageQuality} from './youtube-player-placeholder';

const VIDEO_ID = 'a12345';
const YT_LOADING_STATE_MOCK = {loading: 1, loaded: 0};
const TEST_PROVIDERS: (Provider | EnvironmentProviders)[] = [
  {
    provide: YOUTUBE_PLAYER_CONFIG,
    useValue: {
      // Disable API loading in tests since we don't want to pull in any additional scripts.
      loadApi: false,
    },
  },
];

describe('YoutubePlayer', () => {
  let playerCtorSpy: jasmine.Spy;
  let playerSpy: jasmine.SpyObj<YT.Player>;
  let fixture: ComponentFixture<TestApp>;
  let testComponent: TestApp;
  let events: Required<YT.Events>;

  beforeEach(waitForAsync(() => {
    const fake = createFakeYtNamespace();
    playerCtorSpy = fake.playerCtorSpy;
    playerSpy = fake.playerSpy;
    window.YT = fake.namespace;
    events = fake.events;
  }));

  function getVideoHost(componentFixture: ComponentFixture<unknown>): HTMLElement {
    // Not the most resilient selector, but we don't want to introduce any
    // classes/IDs on the `div` so users don't start depending on it.
    return componentFixture.nativeElement.querySelector('div > div');
  }

  function getPlaceholder(componentFixture: ComponentFixture<unknown>): HTMLElement {
    return componentFixture.nativeElement.querySelector('youtube-player-placeholder');
  }

  describe('API ready', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({providers: TEST_PROVIDERS});
      fixture = TestBed.createComponent(TestApp);
      testComponent = fixture.debugElement.componentInstance;
      fixture.detectChanges();
    });

    afterEach(() => {
      (window as any).YT = undefined;
      window.onYouTubeIframeAPIReady = undefined;
    });

    it('initializes a youtube player when the placeholder is clicked', () => {
      getPlaceholder(fixture).click();
      fixture.detectChanges();
      events.onReady({target: playerSpy});
      fixture.detectChanges();

      expect(playerCtorSpy).toHaveBeenCalledWith(
        getVideoHost(fixture),
        jasmine.objectContaining({
          videoId: VIDEO_ID,
          width: DEFAULT_PLAYER_WIDTH,
          height: DEFAULT_PLAYER_HEIGHT,
          playerVars: {autoplay: 1},
        }),
      );

      expect(getPlaceholder(fixture)).toBeFalsy();
    });

    it('destroys the iframe when the component is destroyed', () => {
      getPlaceholder(fixture).click();
      fixture.detectChanges();

      events.onReady({target: playerSpy});

      testComponent.visible = false;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(playerSpy.destroy).toHaveBeenCalled();
    });

    it('responds to changes in video id', () => {
      getPlaceholder(fixture).click();
      fixture.detectChanges();

      const containerElement = getVideoHost(fixture);

      testComponent.videoId = 'otherId';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(playerSpy.cueVideoById).not.toHaveBeenCalled();

      events.onReady({target: playerSpy});

      expect(playerSpy.cueVideoById).toHaveBeenCalledWith(
        jasmine.objectContaining({videoId: 'otherId'}),
      );

      testComponent.videoId = undefined;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(playerSpy.destroy).toHaveBeenCalled();

      testComponent.videoId = 'otherId2';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(playerCtorSpy).toHaveBeenCalledWith(
        containerElement,
        jasmine.objectContaining({videoId: 'otherId2'}),
      );
    });

    it('responds to changes in size', () => {
      getPlaceholder(fixture).click();
      fixture.detectChanges();

      testComponent.width = 5;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(playerSpy.setSize).not.toHaveBeenCalled();

      events.onReady({target: playerSpy});

      expect(playerSpy.setSize).toHaveBeenCalledWith(5, DEFAULT_PLAYER_HEIGHT);
      expect(testComponent.youtubePlayer.width).toBe(5);
      expect(testComponent.youtubePlayer.height).toBe(DEFAULT_PLAYER_HEIGHT);

      testComponent.height = 6;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(playerSpy.setSize).toHaveBeenCalledWith(5, 6);
      expect(testComponent.youtubePlayer.width).toBe(5);
      expect(testComponent.youtubePlayer.height).toBe(6);

      testComponent.videoId = undefined;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      testComponent.videoId = VIDEO_ID;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(playerCtorSpy).toHaveBeenCalledWith(
        jasmine.any(Element),
        jasmine.objectContaining({width: 5, height: 6}),
      );
      expect(testComponent.youtubePlayer.width).toBe(5);
      expect(testComponent.youtubePlayer.height).toBe(6);

      events.onReady({target: playerSpy});
      testComponent.width = undefined;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(playerSpy.setSize).toHaveBeenCalledWith(DEFAULT_PLAYER_WIDTH, 6);
      expect(testComponent.youtubePlayer.width).toBe(DEFAULT_PLAYER_WIDTH);
      expect(testComponent.youtubePlayer.height).toBe(6);

      testComponent.height = undefined;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(playerSpy.setSize).toHaveBeenCalledWith(DEFAULT_PLAYER_WIDTH, DEFAULT_PLAYER_HEIGHT);
      expect(testComponent.youtubePlayer.width).toBe(DEFAULT_PLAYER_WIDTH);
      expect(testComponent.youtubePlayer.height).toBe(DEFAULT_PLAYER_HEIGHT);
    });

    it('passes the configured playerVars to the player', () => {
      getPlaceholder(fixture).click();
      fixture.detectChanges();
      events.onReady({target: playerSpy});

      const playerVars: YT.PlayerVars = {modestbranding: YT.ModestBranding.Modest};
      fixture.componentInstance.playerVars = playerVars;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      events.onReady({target: playerSpy});
      const calls = playerCtorSpy.calls.all();

      // We expect 2 calls since the first one is run on init and the
      // second one happens after the `playerVars` have changed.
      expect(calls.length).toBe(2);
      expect(calls[0].args[1]).toEqual(jasmine.objectContaining({playerVars: {autoplay: 1}}));
      expect(calls[1].args[1]).toEqual(jasmine.objectContaining({playerVars}));
    });

    it('initializes the player with start and end seconds', () => {
      getPlaceholder(fixture).click();
      fixture.detectChanges();

      testComponent.startSeconds = 5;
      testComponent.endSeconds = 6;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(playerSpy.cueVideoById).not.toHaveBeenCalled();

      playerSpy.getPlayerState.and.returnValue(window.YT!.PlayerState.CUED);
      events.onReady({target: playerSpy});

      expect(playerSpy.cueVideoById).toHaveBeenCalledWith(
        jasmine.objectContaining({startSeconds: 5, endSeconds: 6}),
      );

      testComponent.endSeconds = 8;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(playerSpy.cueVideoById).toHaveBeenCalledWith(
        jasmine.objectContaining({startSeconds: 5, endSeconds: 8}),
      );

      testComponent.startSeconds = 7;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(playerSpy.cueVideoById).toHaveBeenCalledWith(
        jasmine.objectContaining({startSeconds: 7, endSeconds: 8}),
      );

      testComponent.startSeconds = 10;
      testComponent.endSeconds = 11;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(playerSpy.cueVideoById).toHaveBeenCalledWith(
        jasmine.objectContaining({startSeconds: 10, endSeconds: 11}),
      );
    });

    it('sets the suggested quality', () => {
      getPlaceholder(fixture).click();
      fixture.detectChanges();

      testComponent.suggestedQuality = 'small';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(playerSpy.setPlaybackQuality).not.toHaveBeenCalled();

      events.onReady({target: playerSpy});

      expect(playerSpy.setPlaybackQuality).toHaveBeenCalledWith('small');

      testComponent.suggestedQuality = 'large';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(playerSpy.setPlaybackQuality).toHaveBeenCalledWith('large');

      testComponent.videoId = 'other';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(playerSpy.cueVideoById).toHaveBeenCalledWith(
        jasmine.objectContaining({suggestedQuality: 'large'}),
      );
    });

    it('proxies events as output', () => {
      getPlaceholder(fixture).click();
      fixture.detectChanges();

      events.onReady({target: playerSpy});
      expect(testComponent.onReady).toHaveBeenCalledWith({target: playerSpy});

      events.onStateChange({target: playerSpy, data: 5});
      expect(testComponent.onStateChange).toHaveBeenCalledWith({target: playerSpy, data: 5});

      events.onPlaybackQualityChange({target: playerSpy, data: 'large'});
      expect(testComponent.onPlaybackQualityChange).toHaveBeenCalledWith({
        target: playerSpy,
        data: 'large',
      });

      events.onPlaybackRateChange({target: playerSpy, data: 2});
      expect(testComponent.onPlaybackRateChange).toHaveBeenCalledWith({target: playerSpy, data: 2});

      events.onError({target: playerSpy, data: 5});
      expect(testComponent.onError).toHaveBeenCalledWith({target: playerSpy, data: 5});

      events.onApiChange({target: playerSpy});
      expect(testComponent.onApiChange).toHaveBeenCalledWith({target: playerSpy});
    });

    it('proxies methods to the player', () => {
      getPlaceholder(fixture).click();
      fixture.detectChanges();

      events.onReady({target: playerSpy});

      testComponent.youtubePlayer.playVideo();
      expect(playerSpy.playVideo).toHaveBeenCalled();

      testComponent.youtubePlayer.pauseVideo();
      expect(playerSpy.pauseVideo).toHaveBeenCalled();

      testComponent.youtubePlayer.stopVideo();
      expect(playerSpy.stopVideo).toHaveBeenCalled();

      testComponent.youtubePlayer.mute();
      expect(playerSpy.mute).toHaveBeenCalled();

      testComponent.youtubePlayer.unMute();
      expect(playerSpy.unMute).toHaveBeenCalled();

      testComponent.youtubePlayer.isMuted();
      expect(playerSpy.isMuted).toHaveBeenCalled();

      testComponent.youtubePlayer.seekTo(5, true);
      expect(playerSpy.seekTo).toHaveBeenCalledWith(5, true);

      testComponent.youtubePlayer.isMuted();
      expect(playerSpy.isMuted).toHaveBeenCalled();

      testComponent.youtubePlayer.setVolume(54);
      expect(playerSpy.setVolume).toHaveBeenCalledWith(54);

      testComponent.youtubePlayer.getVolume();
      expect(playerSpy.getVolume).toHaveBeenCalled();

      testComponent.youtubePlayer.setPlaybackRate(1.5);
      expect(playerSpy.setPlaybackRate).toHaveBeenCalledWith(1.5);

      testComponent.youtubePlayer.getPlaybackRate();
      expect(playerSpy.getPlaybackRate).toHaveBeenCalled();

      testComponent.youtubePlayer.getAvailablePlaybackRates();
      expect(playerSpy.getAvailablePlaybackRates).toHaveBeenCalled();

      testComponent.youtubePlayer.getVideoLoadedFraction();
      expect(playerSpy.getVideoLoadedFraction).toHaveBeenCalled();

      testComponent.youtubePlayer.getPlayerState();
      expect(playerSpy.getPlayerState).toHaveBeenCalled();

      testComponent.youtubePlayer.getCurrentTime();
      expect(playerSpy.getCurrentTime).toHaveBeenCalled();

      testComponent.youtubePlayer.getPlaybackQuality();
      expect(playerSpy.getPlaybackQuality).toHaveBeenCalled();

      testComponent.youtubePlayer.getAvailableQualityLevels();
      expect(playerSpy.getAvailableQualityLevels).toHaveBeenCalled();

      testComponent.youtubePlayer.getDuration();
      expect(playerSpy.getDuration).toHaveBeenCalled();

      testComponent.youtubePlayer.getVideoUrl();
      expect(playerSpy.getVideoUrl).toHaveBeenCalled();

      testComponent.youtubePlayer.getVideoEmbedCode();
      expect(playerSpy.getVideoEmbedCode).toHaveBeenCalled();
    });

    it('should play on init if playVideo was called before the API has loaded', () => {
      getPlaceholder(fixture).click();
      fixture.detectChanges();

      testComponent.youtubePlayer.playVideo();
      expect(testComponent.youtubePlayer.getPlayerState()).toBe(YT.PlayerState.PLAYING);

      events.onReady({target: playerSpy});

      expect(playerSpy.playVideo).toHaveBeenCalled();
    });

    it('should pause on init if pauseVideo was called before the API has loaded', () => {
      getPlaceholder(fixture).click();
      fixture.detectChanges();

      testComponent.youtubePlayer.pauseVideo();
      expect(testComponent.youtubePlayer.getPlayerState()).toBe(YT.PlayerState.PAUSED);

      events.onReady({target: playerSpy});

      expect(playerSpy.pauseVideo).toHaveBeenCalled();
    });

    it('should stop on init if stopVideo was called before the API has loaded', () => {
      getPlaceholder(fixture).click();
      fixture.detectChanges();

      testComponent.youtubePlayer.stopVideo();
      expect(testComponent.youtubePlayer.getPlayerState()).toBe(YT.PlayerState.CUED);

      events.onReady({target: playerSpy});

      expect(playerSpy.stopVideo).toHaveBeenCalled();
    });

    it('should set the playback rate on init if setPlaybackRate was called before the API has loaded', () => {
      getPlaceholder(fixture).click();
      fixture.detectChanges();

      testComponent.youtubePlayer.setPlaybackRate(1337);
      expect(testComponent.youtubePlayer.getPlaybackRate()).toBe(1337);

      events.onReady({target: playerSpy});

      expect(playerSpy.setPlaybackRate).toHaveBeenCalledWith(1337);
    });

    it('should set the volume on init if setVolume was called before the API has loaded', () => {
      getPlaceholder(fixture).click();
      fixture.detectChanges();

      testComponent.youtubePlayer.setVolume(37);
      expect(testComponent.youtubePlayer.getVolume()).toBe(37);

      events.onReady({target: playerSpy});

      expect(playerSpy.setVolume).toHaveBeenCalledWith(37);
    });

    it('should mute on init if mute was called before the API has loaded', () => {
      getPlaceholder(fixture).click();
      fixture.detectChanges();

      testComponent.youtubePlayer.mute();
      expect(testComponent.youtubePlayer.isMuted()).toBe(true);

      events.onReady({target: playerSpy});

      expect(playerSpy.mute).toHaveBeenCalled();
    });

    it('should unmute on init if umMute was called before the API has loaded', () => {
      getPlaceholder(fixture).click();
      fixture.detectChanges();

      testComponent.youtubePlayer.unMute();
      expect(testComponent.youtubePlayer.isMuted()).toBe(false);

      events.onReady({target: playerSpy});

      expect(playerSpy.unMute).toHaveBeenCalled();
    });

    it('should seek on init if seekTo was called before the API has loaded', () => {
      getPlaceholder(fixture).click();
      fixture.detectChanges();

      testComponent.youtubePlayer.seekTo(1337, true);
      expect(testComponent.youtubePlayer.getCurrentTime()).toBe(1337);

      events.onReady({target: playerSpy});

      expect(playerSpy.seekTo).toHaveBeenCalledWith(1337, true);
    });

    it('should be able to disable cookies', () => {
      getPlaceholder(fixture).click();
      fixture.detectChanges();
      events.onReady({target: playerSpy});

      const containerElement = getVideoHost(fixture);

      expect(playerCtorSpy).toHaveBeenCalledWith(
        containerElement,
        jasmine.objectContaining({
          host: undefined,
        }),
      );

      playerCtorSpy.calls.reset();
      fixture.componentInstance.disableCookies = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(playerCtorSpy).toHaveBeenCalledWith(
        containerElement,
        jasmine.objectContaining({
          host: 'https://www.youtube-nocookie.com',
        }),
      );
    });

    it('should play with a playlist id instead of a video id', () => {
      getPlaceholder(fixture).click();
      fixture.detectChanges();
      playerCtorSpy.calls.reset();

      const playerVars: YT.PlayerVars = {
        list: 'some-playlist-id',
        listType: 'playlist',
      };

      testComponent.videoId = undefined;
      testComponent.playerVars = playerVars;
      fixture.changeDetectorRef.markForCheck();

      fixture.detectChanges();

      let calls = playerCtorSpy.calls.all();

      expect(calls.length).toBe(1);
      expect(calls[0].args[1]).toEqual(jasmine.objectContaining({playerVars, videoId: undefined}));

      playerSpy.destroy.calls.reset();
      playerCtorSpy.calls.reset();

      // Change the vars so that the list type is undefined
      // We only support a "list" if there's an accompanying "listType"
      testComponent.playerVars = {
        ...playerVars,
        listType: undefined,
      };
      fixture.changeDetectorRef.markForCheck();

      fixture.detectChanges();

      // The previous instance should have been destroyed
      expect(playerSpy.destroy).toHaveBeenCalled();

      // Don't expect it to have been called
      expect(playerCtorSpy.calls.all().length).toHaveSize(0);
    });
  });

  describe('API loaded asynchronously', () => {
    let api: typeof YT;

    beforeEach(() => {
      api = window.YT;
      (window as any).YT = undefined;
    });

    afterEach(() => {
      (window as any).YT = undefined;
      window.onYouTubeIframeAPIReady = undefined;
    });

    it('waits until the api is ready before initializing', () => {
      (window.YT as any) = YT_LOADING_STATE_MOCK;
      TestBed.configureTestingModule({providers: TEST_PROVIDERS});
      fixture = TestBed.createComponent(TestApp);
      testComponent = fixture.debugElement.componentInstance;
      fixture.detectChanges();
      getPlaceholder(fixture).click();
      fixture.detectChanges();

      expect(playerCtorSpy).not.toHaveBeenCalled();

      window.YT = api!;
      window.onYouTubeIframeAPIReady!();

      expect(playerCtorSpy).toHaveBeenCalledWith(
        getVideoHost(fixture),
        jasmine.objectContaining({
          videoId: VIDEO_ID,
          width: DEFAULT_PLAYER_WIDTH,
          height: DEFAULT_PLAYER_HEIGHT,
        }),
      );
    });

    it('should not override any pre-existing API loaded callbacks', () => {
      const spy = jasmine.createSpy('other API loaded spy');
      window.onYouTubeIframeAPIReady = spy;
      TestBed.configureTestingModule({providers: TEST_PROVIDERS});
      fixture = TestBed.createComponent(TestApp);
      testComponent = fixture.debugElement.componentInstance;
      fixture.detectChanges();
      getPlaceholder(fixture).click();
      fixture.detectChanges();

      expect(playerCtorSpy).not.toHaveBeenCalled();

      window.YT = api!;
      window.onYouTubeIframeAPIReady!();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('placeholder behavior', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({providers: TEST_PROVIDERS});
      fixture = TestBed.createComponent(TestApp);
      testComponent = fixture.debugElement.componentInstance;
      fixture.detectChanges();
    });

    afterEach(() => {
      fixture = testComponent = (window as any).YT = window.onYouTubeIframeAPIReady = undefined!;
    });

    it('should show a placeholder', () => {
      const placeholder = getPlaceholder(fixture);
      expect(placeholder).toBeTruthy();
      expect(placeholder.style.backgroundImage).toContain(
        `https://i.ytimg.com/vi_webp/${VIDEO_ID}/sddefault.webp`,
      );
      expect(placeholder.style.width).toBe(`${DEFAULT_PLAYER_WIDTH}px`);
      expect(placeholder.style.height).toBe(`${DEFAULT_PLAYER_HEIGHT}px`);
      expect(placeholder.querySelector('button')).toBeTruthy();

      testComponent.videoId = 'foo123';
      testComponent.width = 100;
      testComponent.height = 50;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(placeholder.style.backgroundImage).toContain(
        'https://i.ytimg.com/vi_webp/foo123/sddefault.webp',
      );
      expect(placeholder.style.width).toBe('100px');
      expect(placeholder.style.height).toBe('50px');
    });

    it('should allow for the placeholder to be disabled', () => {
      expect(getPlaceholder(fixture)).toBeTruthy();

      testComponent.disablePlaceholder = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(getPlaceholder(fixture)).toBeFalsy();
    });

    it('should allow for the placeholder button label to be changed', () => {
      const button = getPlaceholder(fixture).querySelector('button')!;

      expect(button.getAttribute('aria-label')).toBe('Play video');

      testComponent.placeholderButtonLabel = 'Play Star Wars';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(button.getAttribute('aria-label')).toBe('Play Star Wars');
    });

    it('should not show the placeholder if a playlist is assigned', () => {
      expect(getPlaceholder(fixture)).toBeTruthy();

      testComponent.videoId = undefined;
      testComponent.playerVars = {
        list: 'some-playlist-id',
        listType: 'playlist',
      };
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(getPlaceholder(fixture)).toBeFalsy();
    });

    it('should hide the placeholder and start playing if an autoplaying video is assigned', () => {
      expect(getPlaceholder(fixture)).toBeTruthy();
      expect(playerCtorSpy).not.toHaveBeenCalled();

      testComponent.playerVars = {autoplay: 1};
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      events.onReady({target: playerSpy});
      fixture.detectChanges();

      expect(getPlaceholder(fixture)).toBeFalsy();
      expect(playerCtorSpy).toHaveBeenCalled();
    });

    it('should allow for the placeholder image quality to be changed', () => {
      const placeholder = getPlaceholder(fixture);
      expect(placeholder.style.backgroundImage).toContain(
        `https://i.ytimg.com/vi_webp/${VIDEO_ID}/sddefault.webp`,
      );

      testComponent.placeholderImageQuality = 'low';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(placeholder.style.backgroundImage).toContain(
        `https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`,
      );

      testComponent.placeholderImageQuality = 'high';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(placeholder.style.backgroundImage).toContain(
        `https://i.ytimg.com/vi/${VIDEO_ID}/maxresdefault.jpg`,
      );
    });
  });

  it('should pick up static startSeconds and endSeconds values', () => {
    TestBed.configureTestingModule({providers: TEST_PROVIDERS});
    const staticSecondsApp = TestBed.createComponent(StaticStartEndSecondsApp);
    staticSecondsApp.detectChanges();
    getPlaceholder(staticSecondsApp).click();
    staticSecondsApp.detectChanges();

    playerSpy.getPlayerState.and.returnValue(window.YT!.PlayerState.CUED);
    events.onReady({target: playerSpy});

    expect(playerSpy.cueVideoById).toHaveBeenCalledWith(
      jasmine.objectContaining({startSeconds: 42, endSeconds: 1337}),
    );
  });

  it('should be able to subscribe to events after initialization', () => {
    TestBed.configureTestingModule({providers: TEST_PROVIDERS});
    const noEventsApp = TestBed.createComponent(NoEventsApp);
    noEventsApp.detectChanges();
    getPlaceholder(noEventsApp).click();
    noEventsApp.detectChanges();
    events.onReady({target: playerSpy});
    noEventsApp.detectChanges();

    const player = noEventsApp.componentInstance.player;
    const subscriptions: Subscription[] = [];
    const readySpy = jasmine.createSpy('ready spy');
    const stateChangeSpy = jasmine.createSpy('stateChange spy');
    const playbackQualityChangeSpy = jasmine.createSpy('playbackQualityChange spy');
    const playbackRateChangeSpy = jasmine.createSpy('playbackRateChange spy');
    const errorSpy = jasmine.createSpy('error spy');
    const apiChangeSpy = jasmine.createSpy('apiChange spy');

    subscriptions.push(player.ready.subscribe(readySpy));
    events.onReady({target: playerSpy});
    expect(readySpy).toHaveBeenCalledWith({target: playerSpy});

    subscriptions.push(player.stateChange.subscribe(stateChangeSpy));
    events.onStateChange({target: playerSpy, data: 5});
    expect(stateChangeSpy).toHaveBeenCalledWith({target: playerSpy, data: 5});

    subscriptions.push(player.playbackQualityChange.subscribe(playbackQualityChangeSpy));
    events.onPlaybackQualityChange({target: playerSpy, data: 'large'});
    expect(playbackQualityChangeSpy).toHaveBeenCalledWith({target: playerSpy, data: 'large'});

    subscriptions.push(player.playbackRateChange.subscribe(playbackRateChangeSpy));
    events.onPlaybackRateChange({target: playerSpy, data: 2});
    expect(playbackRateChangeSpy).toHaveBeenCalledWith({target: playerSpy, data: 2});

    subscriptions.push(player.error.subscribe(errorSpy));
    events.onError({target: playerSpy, data: 5});
    expect(errorSpy).toHaveBeenCalledWith({target: playerSpy, data: 5});

    subscriptions.push(player.apiChange.subscribe(apiChangeSpy));
    events.onApiChange({target: playerSpy});
    expect(apiChangeSpy).toHaveBeenCalledWith({target: playerSpy});

    subscriptions.forEach(subscription => subscription.unsubscribe());
  });
});

/** Test component that contains a YouTubePlayer. */
@Component({
  selector: 'test-app',
  standalone: true,
  imports: [YouTubePlayer],
  template: `
    @if (visible) {
      <youtube-player #player
        [videoId]="videoId"
        [width]="width"
        [height]="height"
        [startSeconds]="startSeconds"
        [endSeconds]="endSeconds"
        [suggestedQuality]="suggestedQuality"
        [playerVars]="playerVars"
        [disableCookies]="disableCookies"
        [disablePlaceholder]="disablePlaceholder"
        [placeholderButtonLabel]="placeholderButtonLabel"
        [placeholderImageQuality]="placeholderImageQuality"
        (ready)="onReady($event)"
        (stateChange)="onStateChange($event)"
        (playbackQualityChange)="onPlaybackQualityChange($event)"
        (playbackRateChange)="onPlaybackRateChange($event)"
        (error)="onError($event)"
        (apiChange)="onApiChange($event)"/>
    }
  `,
})
class TestApp {
  videoId: string | undefined = VIDEO_ID;
  disableCookies = false;
  visible = true;
  disablePlaceholder = false;
  placeholderButtonLabel = 'Play video';
  placeholderImageQuality: PlaceholderImageQuality = 'standard';
  width: number | undefined;
  height: number | undefined;
  startSeconds: number | undefined;
  endSeconds: number | undefined;
  suggestedQuality: YT.SuggestedVideoQuality | undefined;
  playerVars: YT.PlayerVars | undefined;
  onReady = jasmine.createSpy('onReady');
  onStateChange = jasmine.createSpy('onStateChange');
  onPlaybackQualityChange = jasmine.createSpy('onPlaybackQualityChange');
  onPlaybackRateChange = jasmine.createSpy('onPlaybackRateChange');
  onError = jasmine.createSpy('onError');
  onApiChange = jasmine.createSpy('onApiChange');
  @ViewChild('player') youtubePlayer: YouTubePlayer;
}

@Component({
  standalone: true,
  imports: [YouTubePlayer],
  template: `
    <youtube-player [videoId]="videoId" [startSeconds]="42" [endSeconds]="1337"/>
  `,
})
class StaticStartEndSecondsApp {
  videoId = VIDEO_ID;
}

@Component({
  standalone: true,
  imports: [YouTubePlayer],
  template: `<youtube-player [videoId]="videoId"/>`,
})
class NoEventsApp {
  @ViewChild(YouTubePlayer) player: YouTubePlayer;
  videoId = VIDEO_ID;
}
