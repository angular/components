import {task} from 'gulp';
import {readdirSync, statSync, existsSync, mkdirSync} from 'fs';
import {openScreenshotsCloudStorage, openFirebaseScreenshotsDatabase} from '../task_helpers';
import * as path from 'path';
import * as admin from 'firebase-admin';
const request = require('request');
const imageDiff = require('image-diff');

const SCREENSHOT_DIR = './screenshots';
const FIREBASE_FILELIST = 'screenshot/filenames';
const FIREBASE_REPORT = 'screenshot/reports';

/** Task which upload screenshots generated from e2e test. */
task('screenshots', () => {
  let prNumber = process.env['TRAVIS_PULL_REQUEST'];
  if (prNumber) {
    let database = openFirebaseScreenshotsDatabase();
    return getScreenFilenames(database)
      .then((filenames: string[]) => downloadAllGolds(filenames, database, prNumber))
      .then((results: boolean) => updateResult(database, prNumber, results))
      .then((result: boolean) => updateGithubStatus(result, prNumber))
      .then(() => setScreenFilenames(database, prNumber))
      .then(() => uploadScreenshots(prNumber, 'diff'))
      .then(() => uploadScreenshots(prNumber, 'test'))
      .then(() => updateTravis(database, prNumber))
      .then(() => database.goOffline(), () => database.goOffline());
  }
});

function updateFileResult(database: admin.database.Database, prNumber: string,
                          filenameKey: string, result: boolean): admin.Promise<void>{
  return database.ref(FIREBASE_REPORT).child(`${prNumber}/results/${filenameKey}`).set(result);
}

function updateResult(database: admin.database.Database, prNumber: string,
                      result: boolean): admin.Promise<void> {
  return database.ref(FIREBASE_REPORT).child(`${prNumber}/result`).set(result).then(() => result);
}

function updateTravis(database: admin.database.Database,
                      prNumber: string): admin.Promise<void> {
  return database.ref(FIREBASE_REPORT).child(prNumber).update({
    'commit': process.env['TRAVIS_COMMIT'],
    'sha': process.env['TRAVIS_PULL_REQUEST_SHA'],
    'travis': process.env['TRAVIS_JOB_ID'],
  });
}

/** Get a list of filenames from firebase database. */
function getScreenFilenames(database: admin.database.Database): admin.Promise<string[]> {
  return database.ref(FIREBASE_FILELIST).once('value')
      .then((snapshots: admin.database.DataSnapshot) => {
    return snapshots.val();
  });
}

/** Upload a list of filenames to firebase database as gold. */
function setScreenFilenames(database: admin.database.Database,
                            reportKey?: string): admin.Promise<void> {
  let filenames: string[] = [];
  readdirSync(SCREENSHOT_DIR).map((file: string) => {
    let fullName = path.join(SCREENSHOT_DIR, file);
    let key = file.replace('.screenshot.png', '');
    if (!statSync(fullName).isDirectory() && key) {
      filenames.push(file);
    }
  });
  let filelistDatabase = reportKey ?
    database.ref(FIREBASE_REPORT).child(reportKey).child('filenames') :
    database.ref(FIREBASE_FILELIST);
  return filelistDatabase.set(filenames);
}

/**
 * Upload screenshots to google cloud storage.
 * @param {string} reportKey - The key used in firebase. Here it is the PR number.
 *   If there's no reportKey, we will upload images to 'golds/' folder
 * @param {string} mode - Can be 'test' or 'diff' or null.
 *   If the images are the test results, mode should be 'test'.
 *   If the images are the diff images generated, mode should be 'diff'.
 *   For golds mode should be null.
 */
function uploadScreenshots(reportKey?: string, mode?: 'test' | 'diff') {
  let bucket = openScreenshotsCloudStorage();

  let promises: admin.Promise<void>[] = [];
  let localDir = mode == 'diff' ? `${SCREENSHOT_DIR}/diff` : SCREENSHOT_DIR;
  readdirSync(localDir).map((file: string) => {
    let fileName = path.join(localDir, file);
    let key = file.replace('.screenshot.png', '');
    let destination = (mode == null || !reportKey) ?
      `golds/${file}` : `screenshots/${reportKey}/${mode}/${file}`;

    if (!statSync(fileName).isDirectory() && key) {
      promises.push(bucket.upload(fileName, { destination: destination }));
    }
  });
  return admin.Promise.all(promises);
}

/** Check whether the directory exists. If not then create one. */
function _makeDir(dirName: string) {
  if (!existsSync(dirName)) {
    mkdirSync(dirName, '744');
  }
}

/** Download golds screenshots. */
function downloadAllGolds(
    filenames: string[], database: admin.database.Database,
    reportKey: string): admin.Promise<boolean> {
  _makeDir(`${SCREENSHOT_DIR}/golds`);

  return admin.Promise.all(filenames.map((filename: string) => {
    return downloadGold(filename).then(() => diffScreenshot(filename, database, reportKey));
  })).then((results: boolean[]) => results.every((value: boolean) => value == true));
}

/** Download one gold screenshot */
function downloadGold(filename: string): Promise<void> {
  let bucket = openScreenshotsCloudStorage();
  return bucket.file(`golds/${filename}`).download({
    destination: `${SCREENSHOT_DIR}/golds/${filename}`
  });
}

function diffScreenshot(filename: string, database: admin.database.Database,
                             reportKey: string): admin.Promise<boolean> {
  // TODO(tinayuangao): Run the downloads and diffs in parallel.
  let goldUrl = `${SCREENSHOT_DIR}/golds/${filename}`;
  let pullRequestUrl = `${SCREENSHOT_DIR}/${filename}`;
  let diffUrl = `${SCREENSHOT_DIR}/diff/${filename}`;
  let filenameKey = filename.replace('.screenshot.png', '');

  if (existsSync(goldUrl) && existsSync(pullRequestUrl)) {
    return new admin.Promise((resolve: any, reject: any) => {
      imageDiff({
        actualImage: pullRequestUrl,
        expectedImage: goldUrl,
        diffImage: diffUrl,
      }, (err: any, imagesAreSame: boolean) => {
        if (err) {
          console.log(err);
          imagesAreSame = false;
          reject(err);
        }
        resolve(imagesAreSame);
        return updateFileResult(database, reportKey, filenameKey, imagesAreSame);
      });
    });
  } else {
    return updateFileResult(database, reportKey, filenameKey, false).then(() => false);
  }
}

function decode(value: string): string {
  return value.split('').reverse().join('');
}

function updateGithubStatus(result: boolean, prNumber: string) {
  let state = result ? 'success' : 'failure';
  let sha = process.env['TRAVIS_PULL_REQUEST_SHA'];
  let token = decode(process.env['MATERIAL2_GITHUB_STATUS_TOKEN']);

  let data = JSON.stringify({
    "state": state,
    "target_url": `http://material2-screenshots.firebaseapp.com/${prNumber}`,
    "context": "screenshot-diff",
    "description": `Screenshot test ${state}`
  });

  let headers =  {
    'Authorization': `token ${token}`,
    'User-Agent': 'ScreenshotDiff/1.0.0',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  };

  return new admin.Promise((resolve, reject) => {
    request({
      url: `https://api.github.com/repos/angular/material2/statuses/${sha}`,
      method: 'POST',
      form: data,
      headers: headers
    }, function (error: any, response: any, body: any){
      resolve(response.statusCode);
      console.log(response.statusCode);
    });
  });
}
