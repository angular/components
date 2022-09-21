import {Component, NgModule} from '@angular/core';
import {VERSION} from '@angular/material/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss']
})
export class Footer {
  isNextVersion = location.hostname.startsWith('next.material.angular.io');
  version = VERSION.full;
  year = new Date().getFullYear();
}


@NgModule({
  exports: [Footer],
  declarations: [Footer],
})
export class FooterModule {}
