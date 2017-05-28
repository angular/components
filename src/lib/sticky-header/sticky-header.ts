import {
    Component,
    Directive,
    Input,
    ElementRef,
    ViewContainerRef,
    NgZone,
    Optional,
    OnDestroy,
    Renderer2,
    ChangeDetectorRef,
} from '@angular/core';
import {
    style,
    trigger,
    state,
    transition,
    animate,
    AnimationEvent,
} from '@angular/animations';
import {
    Overlay,
    OverlayState,
    OverlayRef,
    ComponentPortal,
    OverlayConnectionPosition,
    OriginConnectionPosition,
    RepositionScrollStrategy,
} from '../core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {Dir} from '../core/rtl/dir';
import {Platform} from '../core/platform/index';
import 'rxjs/add/operator/first';
import {ScrollDispatcher} from '../core/overlay/scroll/scroll-dispatcher';
import {coerceBooleanProperty} from '../core/coercion/boolean-property';

@Directive({
    selector: '[md-sticky-viewport], [md-sticky]',
    exportAs: 'mdStickyHeader',
})