import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot} from '@angular/router';
import {SECTIONS} from '../../shared/documentation-items/documentation-items';

/**
 * Guard to determine if the sidenav can load, based on whether the section exists in documentation
 * items.
 */
@Injectable({providedIn: 'root'})
export class CanActivateComponentSidenav implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // Searches if the section defined in the base UrlSegment is a valid section from the
    // documentation items. If found, returns true to allow activation, otherwise blocks activation
    // and navigates to '/'.
    const sectionFound = Object.keys(SECTIONS).find(
      (val => val.toLowerCase() === route.url[0].path.toLowerCase()));
    if (sectionFound) { return true; }
    this.router.navigateByUrl('/');
    return false;
  }
}
