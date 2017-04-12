import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MdSnackBar} from '@angular/material';
import {FirebaseService} from '../firebase.service';

/**
 * Component to show test results for one commit. The github status, pull request and travis job
 * information, test result and commit SHA are visible.
 * User can approve the change by updating the github status, or by updating the goldens.
 */
@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.css']
})
export class ViewerComponent {
  messageDuration = {duration: 10000};

  get isApproved() {
    return !!this._service.screenshotResult.approvedTime;
  }

  get screenshotResult() {
    return this._service.screenshotResult;
  }

  get githubSuccess(): boolean {
    return this.screenshotResult.githubStatus === 'success';
  }

  get githubFailure(): boolean {
    return this.screenshotResult.githubStatus === 'failure';
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
      this.snackBar.open(`Approved`, '', this.messageDuration);
    }).catch((error) => {
      this.snackBar.open(`Error ${error}`, '', this.messageDuration);
    });
  }

  updateGithubStatus() {
    this._service.updatePRResult().then((result) => {
      this.snackBar.open(`Approved`, '', this.messageDuration);
    }).catch((error) => {
      this.snackBar.open(error.message, '', this.messageDuration);
    });
  }

  refreshGithubStatus() {
    this._service.getGithubStatus().then((result) => {
      console.log(result);
      this._service.screenshotResult.githubStatus = result;
    });
  }
}
