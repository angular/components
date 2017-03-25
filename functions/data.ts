import * as firebaseAdmin from 'firebase-admin';
import {verifySecureTokenAndExecute} from './jwt_util';

/**
 * Handle data written to temporary folder. Validate the JWT and move the data out of
 * temporary folder if the token is valid.
 * Move the data to 'screenshot/reports/$prNumber/$path
 */
export function verifyJWTAndUpdateData(event: any, path: string) {
  // Only edit data when it is first created. Exit when the data is deleted.
  if (event.data.previous.exists() || !event.data.exists()) {
    return;
  }

  let prNumber = event.params.prNumber;
  let data = event.data.val();

  return verifySecureTokenAndExecute(event).then(() => {
    return firebaseAdmin.database().ref().child('screenshot/reports')
      .child(prNumber).child(path).set(data);
  });
};
