import {Component, ViewEncapsulation} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';

@Component({
  moduleId: module.id,
  selector: 'tabs-demo',
  templateUrl: 'tabs-demo.html',
  styleUrls: ['tabs-demo.css'],
  encapsulation: ViewEncapsulation.None,
})
export class TabsDemo {
  tabLinks = [
    { label: 'Sun', link: 'sunny-tab'},
    { label: 'Rain', link: 'rainy-tab'},
    { label: 'Fog', link: 'foggy-tab'},
  ];
  activeLinkIndex = 0;

  tabs = [
    { label: 'Tab One', content: 'This is the body of the first tab' },
    { label: 'Tab Two', content: 'This is the body of the second tab' },
    { label: 'Tab Three', content: 'This is the body of the third tab' },
  ];

  asyncTabs: Observable<any>;

  constructor(private router: Router) {
    this.asyncTabs = Observable.create((observer: any) => {
      setTimeout(() => {
        observer.next(this.tabs);
      }, 1000);
    });

    this.activeLinkIndex =
        this.tabLinks.findIndex(routedTab => router.url.indexOf(routedTab.link) != -1);
  }
}


@Component({
  moduleId: module.id,
  selector: 'tabs-demo-routed-content-1',
  template: 'This is the routed body of the sunny tab.',
})
export class SunnyTabContent {}


@Component({
  moduleId: module.id,
  selector: 'tabs-demo-routed-content-2',
  template: 'This is the routed body of the rainy tab.',
})
export class RainyTabContent {}


@Component({
  moduleId: module.id,
  selector: 'tabs-demo-routed-content-3',
  template: 'This is the routed body of the foggy tab.',
})
export class FoggyTabContent {}
