import { Component, ChangeDetectionStrategy, Input, ViewEncapsulation, Directive } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'md-footer, mat-footer',
  template: '<footer class="md-footer"><ng-content></ng-content></footer>',
  styleUrls: ['footer.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class MdFooter { }

@Component({
  moduleId: module.id,
  selector: 'md-footer-ul, mat-footer-ul',
  template: '<ul class="md-footer-link-list"><ng-content></ng-content></ul>'
})
export class MdFooterUL { }

@Directive({
  selector: 'md-footer-left, mat-footer-left',
  host: {
    '[class.md-footer-left-section]': 'true',
  }
})
export class MdFooterLeft { }

@Directive({
  selector: 'md-footer-right, mat-footer-right',
  host: {
    '[class.md-footer-right-section]': 'true',
  }
})
export class MdFooterRight { }

@Directive({
  selector: 'md-footer-top, mat-footer-top',
  host: {
    '[class.md-footer-top-section]': 'true',
  }
})
export class MdFooterTop { }

@Directive({
  selector: 'md-footer-middle, mat-footer-middle',
  host: {
    '[class.md-footer-middle-section]': 'true',
  }
})
export class MdFooterMiddle { }

@Component({
  selector: 'md-footer-dd, mat-footer-dd',
  template: `<input class="md-footer-heading-checkbox" type="checkbox" checked>
  <h1 *ngIf="heading" class="md-footer-heading">{{heading}}</h1>
  <ul class="md-footer-link-list"><ng-content></ng-content></ul>`,
  host: {
    '[class.md-footer-drop-down-section]': 'true',
  }
})
export class MdFooterDropDown {
  @Input('heading') heading: string;
}


@Directive({
  selector: 'md-footer-bottom, mat-footer-bottom',
  host: {
    '[class.md-footer-bottom-section]': 'true',
  }
})
export class MdFooterBottom { }

@Directive({
  selector: 'md-footer-logo, mat-footer-logo',
  host: {
    '[class.md-footer-logo]': 'true',
  },
})
export class MdFooterLogo { }