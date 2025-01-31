import {
  Component,
  HostBinding,
  Input,
  OnInit,
  ViewContainerRef,
  ViewEncapsulation,
  viewChild,
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-scene-viewer',
  templateUrl: './scene-viewer.html',
  styleUrls: ['./scene-viewer.scss'],
  standalone: true,
})
export class SceneViewer implements OnInit {
  @HostBinding('style.filter') filter: SafeStyle | undefined;

  /**
   * Degree to change hue of scene by. All scenes default to a reddish hue.
   * e.g. 90 = greenish, 180 = blueish
   */
  @Input()
  get hueRotation(): number {
    return this._hueRotation;
  }

  set hueRotation(deg: number) {
    this._hueRotation = deg;
    // Modern browsers have security built in so this is just bypassing Angular's redundant checks.
    // Furthermore these checks will soon be removed.
    this.filter = this.sanitizer.bypassSecurityTrustStyle(`hue-rotate(${this.hueRotation}deg)`);
  }
  private _hueRotation = 0;

  /** Scale of scene (1 is unscaled) */
  @Input() scale = 1;

  /** Component of scene to display */
  @Input() component: any;

  readonly scene = viewChild.required('scene', {read: ViewContainerRef});

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
  ) {
    this.hueRotation = this.route.snapshot.data['hueRotate'];
    this.component = this.route.snapshot.data['scene'];
    this.scale = this.route.snapshot.data['scale'];
  }

  ngOnInit() {
    this.scene().createComponent(this.component);
    const container = document.querySelector('#scene-content-container') as HTMLElement;
    container.style.transform = `scale(${this.scale})`;
    container.style.transformOrigin = 'center';
  }
}
