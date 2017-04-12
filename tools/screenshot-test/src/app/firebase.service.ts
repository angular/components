import {Injectable} from '@angular/core';
import * as firebase from 'firebase';

const request = require('request');
const config = require('../config.json');

import {ScreenshotResult} from './screenshot-result';

/** The service to fetch data from firebase database */
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
        }
        counter++;
        if (counter === snapshot.numChildren()) {
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
    return this._databaseRef().child('approved').child(this.screenshotResult.sha).set(Date.now());
  }

  /** Change the commit's screenshot test status on GitHub */
  updatePRResult() {
    return this._databaseRef().child('result').child(this.screenshotResult.sha)
      .set(true);
  }

  _databaseRef(): firebase.database.Reference {
    return firebase.database().ref('screenshot').child('reports')
      .child(this.screenshotResult.prNumber);
  }

  _storageRef(): firebase.storage.Reference {
    return firebase.storage().ref('screenshots').child(this.screenshotResult.prNumber);
  }

  /** Put the testResultsByName in screenshotReuslt */
  _processResults(childSnapshot: firebase.database.DataSnapshot) {
    let childCounter = 0;
    this.screenshotResult.collapse = [];
    this.screenshotResult.testNames = [];
    this.screenshotResult.testResultsByName.clear();
    childSnapshot.forEach((resultSnapshot: firebase.database.DataSnapshot) => {
      let key = resultSnapshot.key;
      let value = resultSnapshot.val();
      this.screenshotResult.testResultsByName.set(key, value);
      this.screenshotResult.testNames.push(key);
      this.screenshotResult.collapse.push(value);
      childCounter++;
      if (childCounter === childSnapshot.numChildren()) {
        return true;
      }
    });
  }

  _processSha(childValue) {
    this.screenshotResult.sha = childValue;
    // Get github status
    this.getGithubStatus().then((result) => this.screenshotResult.githubStatus = result);
    // Get test allTestsPassedOrApproved
    this._databaseRef().child(`result/${childValue}`).once('value')
      .then((dataSnapshot: firebase.database.DataSnapshot) => {
        this.screenshotResult.allTestsPassedOrApproved = dataSnapshot.val();
      });
    // Get the approved SHA and date time
    this._databaseRef().child(`approved/${childValue}`).once('value')
      .then((dataSnapshot: firebase.database.DataSnapshot) => {
        this.screenshotResult.approvedTime = dataSnapshot.val();
      });
  }

  getGithubStatus() {
    let url =
      `https://api.github.com/repos/${config.repoSlug}/commits/${this.screenshotResult.sha}/status`;
    return new Promise((resolve) => {
      request({url, method: 'GET'}, (error: any, response: any) => {
        let statusResponse = JSON.parse(response.body);
        let screenshotStatus = statusResponse.statuses.find((status) =>
          status.context === 'Screenshot Tests');
        resolve(screenshotStatus ? screenshotStatus.state : null);
      });
    });
  }
}
