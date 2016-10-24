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
    { label: 'Tab One', link: 'content-1'},
    { label: 'Tab Two', link: 'content-2'},
    { label: 'Tab Three', link: 'content-3'},
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
  template: 'This is the routed body of the first tab.',
})
export class RoutedContent1 {}


@Component({
  moduleId: module.id,
  selector: 'tabs-demo-routed-content-2',
  template: 'This is the routed body of the second tab.',
})
export class RoutedContent2 {}


@Component({
  moduleId: module.id,
  selector: 'tabs-demo-routed-content-3',
  template: 'This is the routed body of the third tab.',
})
export class RoutedContext3 {}
