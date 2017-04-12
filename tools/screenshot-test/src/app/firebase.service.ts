import {Injectable} from '@angular/core';
import * as firebase from 'firebase';

const request = require('request');
const config = require('../config.json');


export class ScreenshotResult {
  /** PR information: the pull request number */
  prNumber: string;
  /** PR information: the sha of the pull request commit */
  sha: string;
  /** PR information: The travis job ID */
  travis: string;

  /** Test result, the test names */
  testnames: string[];
  /** Test result: passed or failed. The value can be true if test failed but PR approved by user */
  result: boolean;
  /** Test results: passed or failed for each test */
  results: Map<string, boolean> = new Map<string, boolean>();
  /**
   * Test approved: whether the test images are copied to goldens.
   * The value is the commit SHA and date/time of approval.
   */
  approved: string;

  githubStatus: any;

  /** Viewing mode, can be flip, diff, side */
  mode: 'diff' | 'side' | 'flip' = 'diff';
  /** Viewing flipping, whether the image is test image or golden image */
  flipping: boolean = false;
  /** Viewing collapsed: whether the result should be collapsed/expanded */
  collapse: boolean[];

  setCollapse(value: boolean) {
    if (this.collapse) {
      for (let i = 0; i < this.collapse.length; i++) {
        this.collapse[i] = value;
      }
    }
  }

  get prLink() {
    return `https://github.com/${config.repoSlug}/pull/${this.prNumber}`;
  }

  get commitLink() {
    return `https://github.com/${config.repoSlug}/commit/${this.sha}`;
  }

  get travisLink() {
    return `https://travis-ci.org/${config.repoSlug}/jobs/${this.travis}`;
  }
}


@Injectable()
export class FirebaseService {

  /** The current user */
  user: any;

  /** The screenshot results */
  screenshotResult: ScreenshotResult;

  constructor() {
    // Initialize Firebase
    firebase.initializeApp(config.firebase);

    firebase.auth().onAuthStateChanged((user) => {
      this.user = user;
    });
  }


  /** Get the firebase storage test image folder ref */
  testRef(): firebase.storage.Reference {
    return this._storageRef().child('test');
  }

  /** Get the firebase storage diff image folder ref */
  diffRef(): firebase.storage.Reference {
    return this._storageRef().child('diff');
  }

  /** Get the firebase storage golden image folder ref */
  goldRef(): firebase.storage.Reference {
    return firebase.storage().ref('goldens');
  }

  /** Set pull request number. All test information and pull request information will be retrived
   * from database
   */
  set prNumber(prNumber: string){
    this.screenshotResult = new ScreenshotResult();
    this.screenshotResult.prNumber = prNumber;
    if (!prNumber) {
      return;
    }

    this._databaseRef().on('value', (snapshot: firebase.database.DataSnapshot) => {
      let counter = 0;
      snapshot.forEach((childSnapshot: firebase.database.DataSnapshot) => {
        let childValue = childSnapshot.val();
        switch (childSnapshot.key) {
          case 'sha':
            this._processSha(childValue);
            break;
          case 'travis':
            this.screenshotResult.travis = childValue;
            break;
          case 'results':
            this._processResults(childSnapshot);
            break;
          case 'approved':
            this.screenshotResult.approved = childValue;
            break;
        }
        counter ++;
        if (counter == snapshot.numChildren()) {
          return true;
        }
      });
    });
  }

  signInGithub(): firebase.Promise<any> {
    return firebase.auth().signInWithRedirect(new firebase.auth.GithubAuthProvider());
  }

  signOutGithub() {
    firebase.auth().signOut();
  }

  /** Change the PR status to approved to let Firebase Functions copy test images to goldens */
  approvePR() {
    return this._databaseRef().child('approved').set(`${this.screenshotResult.sha}-${new Date()}`);
  }

  /** Change the commit's screenshot test status on GitHub */
  updatePRResult() {
    return this._databaseRef().child('result').child(this.screenshotResult.sha).set(true);
  }

  _databaseRef(): firebase.database.Reference {
    return firebase.database().ref('screenshot').child('reports')
      .child(this.screenshotResult.prNumber);
  }

  _storageRef(): firebase.storage.Reference {
    return firebase.storage().ref('screenshots').child(this.screenshotResult.prNumber);
  }

  /** Put the results in screenshotReuslt */
  _processResults(childSnapshot: firebase.database.DataSnapshot) {
    let childCounter = 0;
    this.screenshotResult.collapse = [];
    this.screenshotResult.testnames = [];
    this.screenshotResult.results.clear();
    childSnapshot.forEach((resultSnapshot: firebase.database.DataSnapshot) => {
      let key = resultSnapshot.key;
      let value = resultSnapshot.val();
      this.screenshotResult.results.set(key, value);
      this.screenshotResult.testnames.push(key);
      this.screenshotResult.collapse.push(value);
      childCounter++;
      if (childCounter == childSnapshot.numChildren()) {
        return true;
      }
    });
  }

  _processSha(childValue) {
    this.screenshotResult.sha = childValue;
    // Get github status
    this.getGithubStatus().then((result) => this.screenshotResult.githubStatus = result);
    // Get test result
    this._databaseRef().child(`result/${childValue}`).once('value')
      .then((dataSnapshot: firebase.database.DataSnapshot) => {
        this.screenshotResult.result = dataSnapshot.val();
      });
  }

  getGithubStatus() {
    let url =
      `https://api.github.com/repos/${config.repoSlug}/commits/${this.screenshotResult.sha}/status`;
    return new Promise((resolve) => {
      request({
        url: url,
        method: 'GET',
      }, function (error: any, response: any) {
        let statusResponse = JSON.parse(response.body);
        for (let status of statusResponse.statuses) {
          if (status.context == 'Screenshot Tests') {
            resolve(status.state);
          }
        }
        resolve(null);
      });
    });
  }
}
