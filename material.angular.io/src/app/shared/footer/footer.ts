import {Component, NgModule} from '@angular/core';
import {materialVersion} from '../version/version';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss']
})
export class Footer {
  version = materialVersion;
}


@NgModule({
  exports: [Footer],
  declarations: [Footer],
})
export class FooterModule {}
