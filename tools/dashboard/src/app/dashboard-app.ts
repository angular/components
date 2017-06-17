import {Component} from '@angular/core';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';

@Component({
  selector: 'dashboard-app',
  templateUrl: './dashboard-app.html',
  styleUrls: ['./dashboard-app.css']
})
export class DashboardApp {

  /** Observable that emits all payload results from Firebase. */
  payloads: FirebaseListObservable<PayloadResult[]>;

  constructor(database: AngularFireDatabase) {
    this.payloads = database.list(`payloads`);
  }
}

/** Interface that describes the payload results from the Firebase database. */
interface PayloadResult {
  timestamp: number;
  // Material bundles
  material_umd: string;
  material_umd_minified_uglify: string;
  material_fesm_2015: string;
  material_fesm_2014: string;
  // CDK bundles
  cdk_umd: string;
  cdk_umd_minified_uglify: string;
  cdk_fesm_2015: string;
  cdk_fesm_2014: string;
}
