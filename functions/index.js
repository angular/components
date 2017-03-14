'use strict';

const functions = require('firebase-functions');
const gcs = require('@google-cloud/storage')();
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const fs = require('fs');

admin.initializeApp(functions.config().firebase);

const dataTypes = ['filenames', 'commit', 'result', 'sha', 'travis'];
const repoSlug = functions.config().repo.slug;
const secret = functions.config().secret.key;
const bucket = gcs.bucket(functions.config().firebase.storageBucket);

/** Copy valid data from /temp/screenshot/reports/$prNumber/$secureToken/ to /screenshot/reports/$prNumber */
exports.copyData = functions.database.ref('/temp/screenshot/reports/{prNumber}/{token1}/{token2}/{token3}/{dataType}')
    .onWrite(event => {
  const dataType = event.params.dataType;
  if (dataTypes.indexOf(dataType) == -1) {
    return;
  }
  return handleDataChange(event, dataType);
});

/** Copy valid data from /temp/screenshot/reports/$prNumber/$secureToken/ to /screenshot/reports/$prNumber */
exports.copyDataResult = functions.database.ref('/temp/screenshot/reports/{prNumber}/{token1}/{token2}/{token3}/results/{filename}')
    .onWrite(event => {
  return handleDataChange(event, `results/${event.params.filename}`);
});

/** Copy valid data from database /temp/screenshot/images/$prNumber/$secureToken/ to storage /screenshots/$prNumber */
exports.copyImage = functions.database.ref('/temp/screenshot/images/{prNumber}/{token1}/{token2}/{token3}/{dataType}/{filename}')
    .onWrite(event => {
    // Only edit data when it is first created. Exit when the data is deleted.
    if (event.data.previous.exists() || !event.data.exists()) {
      return;
    }

    const dataType = event.params.dataType;
    const prNumber = event.params.prNumber;
    const secureToken = `${event.params.token1}.${event.params.token2}.${event.params.token3}`;
    const saveFilename = `${event.params.filename}.screenshot.png`;

    if (dataType != 'diff' && dataType != 'test') {
      return;
    }

    return validateSecureToken(secureToken, prNumber).then((payload) => {
        const tempPath = `/tmp/${dataType}-${saveFilename}`
        const filePath = `screenshots/${prNumber}/${dataType}/${saveFilename}`;
        const binaryData = new Buffer(event.data.val(), 'base64').toString('binary');
        fs.writeFile(tempPath, binaryData, 'binary');
        return bucket.upload(tempPath, {
            destination: filePath
          }).then(() => {
            return event.data.ref.parent.set(null);
        });
    }).catch((error) => {
      console.error(`Invalid secure token ${secureToken} ${error}`);
      return event.data.ref.parent.set(null);
    });
});

/**
 * Copy valid goldens from storage /goldens/ to database /screenshot/goldens/
 * so we can read the goldens without credentials
 */
exports.copyGoldens = functions.storage.bucket(functions.config().firebase.storageBucket).object().onChange(event => {
    const filePath = event.data.name;

    // Get the file name.
    const fileNames = filePath.split('/');
    if (fileNames.length != 2 && fileNames[0] != 'goldens') {
      return;
    }
    const filenameKey = fileNames[1].replace('.screenshot.png', '');

    if (event.data.resourceState === 'not_exists') {
      return admin.database().ref(`screenshot/goldens/${filenameKey}`).set(null);
    }

    // Download file from bucket.
    const bucket = gcs.bucket(event.data.bucket);
    const tempFilePath = `/tmp/${fileNames[1]}`;
    return bucket.file(filePath).download({
        destination: tempFilePath
      }).then(() => {
        const data = fs.readFileSync(tempFilePath);
        return admin.database().ref(`screenshot/goldens/${filenameKey}`).set(data);
    });
});

function handleDataChange(event, path) {
  // Only edit data when it is first created. Exit when the data is deleted.
  if (event.data.previous.exists() || !event.data.exists()) {
    return;
  }

  const prNumber = event.params.prNumber;
  const secureToken = `${event.params.token1}.${event.params.token2}.${event.params.token3}`;
  const original = event.data.val();

  return validateSecureToken(secureToken, prNumber).then((payload) => {
      return admin.database().ref().child('screenshot/reports').child(prNumber).child(path).set(original).then(() => {
        return event.data.ref.parent.set(null);
      });
  }).catch((error) => {
      console.error(`Invalid secure token ${secureToken} ${error}`);
    return event.data.ref.parent.set(null);
  });
}

function validateSecureToken(token, prNumber) {
  return new Promise((resolve, reject) => {
      jwt.verify(token, secret, {issuer: 'Travis CI, GmbH'}, (err, payload) => {
        if (err) {
          reject(err.message || err);
        } else if (payload.slug !== repoSlug) {
          reject(`jwt slug invalid. expected: ${repoSlug}`);
        } else if (payload['pull-request'].toString() !== prNumber) {
          reject(`jwt pull-request invalid. expected: ${prNumber} actual: ${payload['pull-request']}`);
        } else {
          resolve(payload);
        }
      });
  });
}
