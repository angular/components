import {Component} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'loading-overlay-demo',
  templateUrl: 'loading-overlay-demo.html',
  styleUrls: ['loading-overlay-demo.css'],
})
export class LoadingOverlayDemo {
  private isLoading: boolean = false;
}
