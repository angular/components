import * as firebaseFunctions from 'firebase-functions';
import {writeFileSync} from 'fs';
import {verifySecureTokenAndExecute} from './jwt_util';

const gcs = require('@google-cloud/storage')();

/** The storage bucket to store the images. The bucket is also used by Firebase Storage. */
const bucket = gcs.bucket(firebaseFunctions.config().firebase.storageBucket);

/**
 * Convert data to images. Image data posted to database will be saved as png files
 * and upload to screenshot/$prNumber/dataType/$filename
 */
export function convertTestImageDataToFiles(event: any) {
  // Only edit data when it is first created. Exit when the data is deleted.
  if (event.data.previous.exists() || !event.data.exists()) {
    return;
  }

  let dataType = event.params.dataType;
  let prNumber = event.params.prNumber;
  let data = event.data.val();
  let saveFilename = `${event.params.filename}.screenshot.png`;

  if (dataType != 'diff' && dataType != 'test') {
    return;
  }

  return verifySecureTokenAndExecute(event).then(() => {
    let tempPath = `/tmp/${dataType}-${saveFilename}`;
    let filePath = `screenshots/${prNumber}/${dataType}/${saveFilename}`;
    let binaryData = new Buffer(data, 'base64').toString('binary');
    writeFileSync(tempPath, binaryData, 'binary');
    return bucket.upload(tempPath, {destination: filePath});
  });
};
