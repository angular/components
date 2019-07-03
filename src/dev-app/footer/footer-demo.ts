/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'footer-demo',
  templateUrl: 'footer-demo.html',
  styleUrls: ['footer-demo.css'],
})
export class FooterDemo {
    siteLinks = [
        {text: 'MARSH', routerLink: '/marsh'},
        {text: 'GUY CARPENTER', routerLink: '/guy-carpenter'},
        {text: 'MERCER', routerLink: '/mercer'},
        {text: 'OLIVER WYMAN', routerLink: '/oliver-wyman'},
    ];
    legalLinks = [
        {text: 'TERMS OF USE', routerLink: '/terms-of-use'},
        {text: 'PRIVACY POLICY', routerLink: '/privacy-policy'},
        {text: 'CONTACT US', routerLink: '/contact-us'},
    ];
    facebookLink = 'https://www.facebook.com/pages/Guy-Carpenter-/146054192105911';
    linkedinLink = 'https://www.linkedin.com/company/guy-carpenter/';
    twitterLink = 'https://twitter.com/guycarpenter';
}
