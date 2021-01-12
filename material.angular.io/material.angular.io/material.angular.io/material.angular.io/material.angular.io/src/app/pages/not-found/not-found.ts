import {Component, NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {FooterModule} from '../../shared/footer/footer';
import {RouterModule, Routes} from '@angular/router';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.html',
  styleUrls: ['./not-found.scss']
})
export class NotFound {
}

const routes: Routes = [{path: '', component: NotFound}];

@NgModule({
  imports: [MatButtonModule, FooterModule, RouterModule.forChild(routes)],
  exports: [NotFound],
  declarations: [NotFound]
})
export class NotFoundModule {
}
