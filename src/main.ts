import {bootstrap} from 'angular2/platform/browser';
import {DemoApp} from './demo-app/demo-app';
import {HTTP_PROVIDERS} from 'angular2/http';
import {ROUTER_PROVIDERS} from 'angular2/router';
import {MdIconRegistry} from './components/icon/icon-registry';
import {OVERLAY_CONTAINER_TOKEN} from './core/overlay/overlay';
import {MdLiveAnnouncer} from './core/live-announcer/live-announcer';
import {provide} from 'angular2/core';
import {createOverlayContainer} from './core/overlay/overlay-container';
import {Renderer} from 'angular2/core';
import 'rxjs/Rx';

bootstrap(DemoApp, [
  ROUTER_PROVIDERS,
  MdLiveAnnouncer,
  provide(OVERLAY_CONTAINER_TOKEN, {useValue: createOverlayContainer()}),
  HTTP_PROVIDERS,
  MdIconRegistry,
  Renderer,
]);
