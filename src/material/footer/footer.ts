/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Input,
    ViewEncapsulation
} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';

@Component({
    moduleId: module.id,
    selector: 'mat-footer',
    templateUrl: 'footer.html',
    styleUrls: ['footer.css'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatFooter {

    @Input() siteLinks: [{text: string, routerLink: string}];
    @Input() copyrightDate: string;
    @Input() legalLinks: [{text: string, routerLink: string}];
    @Input() facebookLink: string;
    @Input() linkedinLink: string;
    @Input() twitterLink: string;

    constructor(
        private _elementRef: ElementRef<HTMLElement>,
        private _breakpointObserver: BreakpointObserver,
    ) {
        this._breakpointObserver
            .observe([Breakpoints.XSmall])
            .subscribe(() => {
                this._toggleClass('mat-footer-xsmall',
                    this._breakpointObserver.isMatched(Breakpoints.XSmall));
            });
    }

    private _toggleClass(cssClass: string, add: boolean) {
        const classList = this._elementRef.nativeElement.classList;
        add ? classList.add(cssClass) : classList.remove(cssClass);
    }
}
