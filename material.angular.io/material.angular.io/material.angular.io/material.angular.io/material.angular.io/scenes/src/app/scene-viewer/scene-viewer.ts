import {
  Component,
  ComponentFactoryResolver,
  Input,
  NgModule,
  OnInit,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-scene-viewer',
  templateUrl: './scene-viewer.html',
  styleUrls: ['./scene-viewer.scss'],
  host: {'[style.filter]': 'cssFilter'}
})
export class SceneViewer implements OnInit {
  /**
   * Degree to change hue of scene by. All scenes default to a reddish hue.
   * e.g. 90 = greenish, 180 = blueish
   */
  @Input()
  get hueRotation(): number { return this._hueRotation; }
  set hueRotation(deg: number) {
    this._hueRotation = deg;
    this.cssFilter = this.sanitizer.bypassSecurityTrustStyle(`hue-rotate(${this.hueRotation}deg)`);
  }
  private _hueRotation: number;

  /** Component of scene to display */
  @Input() component: any;

  @ViewChild('scene', {read: ViewContainerRef, static: true})
  scene: ViewContainerRef;

  cssFilter: SafeStyle;

  constructor(private readonly componentFactoryResolver: ComponentFactoryResolver,
              private route: ActivatedRoute,
              private sanitizer: DomSanitizer) {
    this.hueRotation = this.route.snapshot.data['hueRotate'];
    this.component = this.route.snapshot.data['scene'];
  }

  ngOnInit() {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.component);
    this.scene.createComponent(componentFactory);
  }
}

@NgModule({
  imports: [
    CommonModule,
  ],
  exports: [SceneViewer],
  declarations: [SceneViewer]
})
export class SceneViewerModule {
}

