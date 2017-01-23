import {task} from 'gulp';
import {readdirSync, statSync, existsSync, mkdirSync} from 'fs';
import {openScreenshotsCloudStorage, openScreenshotsFirebaseDatabase} from '../task_helpers';
const imageDiff = require('image-diff');

const SCREENSHOT_DIR = './screenshots';
const FIREBASE_FILELIST = 'screenshot/filenames';
const FIREBASE_REPORT = 'screenshot/reports';

/** Task which upload screenshots generated from e2e test. */
task('screenshots', () => {
  let prNumber = process.env['TRAVIS_PULL_REQUEST'];
  if (prNumber) {
    let database = openScreenshotsFirebaseDatabase();
    return getFilenameList(database)
      .then((filenames: string[]) => {
        return downloadReferenceScreenshots(filenames, database)
          .then((results: any) => {
            return compareScreenshots(filenames, database, prNumber);
          });
      })
      .then((results: boolean) => {
        return database.ref(FIREBASE_REPORT).child(`${prNumber}/result`).set(results);
      })
      .then(() => database.ref(FIREBASE_REPORT).child(`${prNumber}/commit`).set(process.env['TRAVIS_COMMIT']))
      .then(() => setFilenameList(database, prNumber))
      .then(() => uploadScreenshots(prNumber, 'diff'))
      .then(() => uploadScreenshots(prNumber, 'test'))
      .then(() => database.goOffline(), () => database.goOffline());
  }
});

/** Get a list of filenames from firebase database. */
function getFilenameList(database: any) : Promise<string[]> {
  return database.ref(FIREBASE_FILELIST).once('value').then(function(snapshots: any) {
    return snapshots.val();
  });
}

/** Upload a list of filenames to firebase database as reference. */
function setFilenameList(database: any,
                         reportKey?: string): Promise<any> {
  let filenames: string[] = [];
  readdirSync(SCREENSHOT_DIR).map(function(file) {
    let fullName = SCREENSHOT_DIR + '/' + file;
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

/** Upload screenshots to google cloud storage. */
function uploadScreenshots(reportKey?: string, mode?: 'test' | 'diff') {
  let bucket = openScreenshotsCloudStorage();

  let promises: Promise<any>[] = [];
  let localDir = mode == 'diff' ? `${SCREENSHOT_DIR}/diff` : SCREENSHOT_DIR;
  readdirSync(localDir).map(function(file) {
    let fileName = localDir + '/' + file;
    let key = file.replace('.screenshot.png', '');
    let destination = (mode == null || !reportKey) ?
      `references/${file}` : `screenshots/${reportKey}/${mode}/${file}`;

    if (!statSync(fileName).isDirectory() && key) {
      promises.push(bucket.upload(fileName, { destination: destination }));
    }
  });
  return Promise.all(promises);
}

/** Check whether the directory exists. If not then create one. */
function _makeDir(dirName: string) {
  if (!existsSync(dirName)) {
    mkdirSync(dirName, '744');
  }
}

/** Download references screenshots. */
function downloadReferenceScreenshots(
    filenames: string[], database: any): Promise<any> {
  _makeDir(`${SCREENSHOT_DIR}/references`);

  return Promise.all(filenames.map((filename: string) => {
    return _downloadReferenceScreenshot(filename);
  }));
}

/** Download one reference screenshot */
function _downloadReferenceScreenshot(filename: string): Promise<any> {
  let bucket = openScreenshotsCloudStorage();
  return bucket.file(`references/${filename}`).download({
    destination: `${SCREENSHOT_DIR}/references/${filename}`
  });
}

/** Compare the test result and the reference. */
function compareScreenshots(filenames: string[], database: any, reportKey: string): Promise<any> {
  return Promise.all(filenames.map((filename) =>
    _compareScreenshot(filename, database, reportKey)))
      .then((results: any) => results.every((value: boolean) => value == true));
}

function _compareScreenshot(filename: string, database: any,
                             reportKey: string): Promise<any> {
  let expectedUrl = `${SCREENSHOT_DIR}/references/${filename}`;
  let actualUrl = `${SCREENSHOT_DIR}/${filename}`;
  let diffUrl = `${SCREENSHOT_DIR}/diff/${filename}`;
  let filenameKey = filename.replace('.screenshot.png', '');

  if (existsSync(expectedUrl) && existsSync(actualUrl)) {
    return new Promise(function(resolve, reject) {
      imageDiff({
        actualImage: actualUrl,
        expectedImage: expectedUrl,
        diffImage: diffUrl,
      }, function (err: any, imagesAreSame: boolean) {
        if (err) {
          console.log(err);
          imagesAreSame = false;
          reject(err);
        }
        resolve(imagesAreSame);
        return database.ref(FIREBASE_REPORT).child(`${reportKey}/results/${filenameKey}`)
          .set(imagesAreSame);
      });
    });
  } else {
    return database.ref(FIREBASE_REPORT).child(`${reportKey}/results/${filenameKey}`)
      .set(false).then(() => false);
  }
}
