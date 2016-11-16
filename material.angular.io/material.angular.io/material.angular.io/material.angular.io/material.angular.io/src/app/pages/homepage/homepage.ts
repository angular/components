import { Component} from '@angular/core';

@Component({
  selector: 'app-homepage',
  templateUrl: 'homepage.html',
  styleUrls: ['homepage.scss']
})
export class Homepage {
  private _imagePath: string = '../assets/img/homepage/';

  homePageContent = [
    {
      title: 'Sprint from Zero to App',
      content: `Hit the ground running with comprehensive, modern UI components that work across
        the web, mobile and desktop`,
      reverse: false,
      img: 'sprintzerotoapp.svg',
    },
    {
      title: 'Fast and Consistent',
      content: `Finely tunes performance, because every millisecond counts. Fully tested across
        modern browsers.`,
      reverse: true,
      img: 'fastandconsistent.svg',
    },
    {
      title: 'Versatile',
      content: `Themable, for when you need to stay on brand or just have a facourite color.
        Accessible and internationalized so that all users are welcome.`,
      reverse: false,
      img: 'versatile.svg',
    },
    {
      title: 'Optimized for Angular',
      content: 'Built by the Angular team to integrate seamlessly with Angular 2.',
      reverse: true,
      img: 'optimized.svg',
    },
  ];

  getImagePath(srcSvg: string): string {
    return this._imagePath + srcSvg;
  }
}
