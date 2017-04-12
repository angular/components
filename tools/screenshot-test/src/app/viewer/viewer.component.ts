import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Input} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MdSnackBar} from '@angular/material';
import {FirebaseService} from '../firebase.service';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.css']
})
export class ViewerComponent {

  get isApproved() {
    return this._service.screenshotResult.approved &&
      this._service.screenshotResult.sha &&
      this._service.screenshotResult.approved.indexOf(this._service.screenshotResult.sha) == 0;
  }

  get screenshotResult() {
    return this._service.screenshotResult;
  }

  constructor(private _service: FirebaseService,
              private _route: ActivatedRoute,
              public snackBar: MdSnackBar) {
    _route.params.subscribe(p => {
      this._service.prNumber = p['id'];
    });
  }

  approve() {
    this._service.approvePR().then((result) => {
      this.snackBar.open(`Approved`, '', {duration: 10000});
    }).catch((error) => {
      this.snackBar.open(`Error ${error}`, '', {duration: 10000});
    });
  }

  updateGithubStatus() {
    this._service.updatePRResult().then((result) => {
      this.snackBar.open(`Approved`, '', {duration: 10000});
    }).catch((error) => {
      this.snackBar.open(error.message, '', {duration: 10000});
    });
  }

  refreshGithubStatus() {
    this._service.getGithubStatus().then((result) => {
      console.log(result);
      this._service.screenshotResult.githubStatus = result;
    });
  }
}
