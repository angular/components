import * as firebaseFunctions from 'firebase-functions';
import {verifySecureToken} from './util/jwt';

/** The repo slug. This is used to validate the JWT is sent from correct repo. */
const repoSlug = firebaseFunctions.config().repo.slug;

/** The JWT secret. This is used to validate JWT. */
const secret = firebaseFunctions.config().secret.key;

/**
 * Extract the Json Web Token from event params.
 * In screenshot gulp task the path we use is {jwtHeader}/{jwtPayload}/{jwtSignature}.
 * Replace '/' with '.' to get the token.
 */
function getSecureToken(event: firebaseFunctions.Event<any>) {
  return `${event.params.jwtHeader}.${event.params.jwtPayload}.${event.params.jwtSignature}`;
};

/**
 * Verify event params have correct JsonWebToken, and execute callback when the JWT is verified.
 * Delete the data if there's an error or the callback is done
 */
export function verifySecureTokenAndExecute(event: firebaseFunctions.Event<any>) {
  return new Promise((resolve, reject) => {
    const prNumber = event.params.prNumber;
    const secureToken = getSecureToken(event);

    return verifySecureToken(secureToken, prNumber, secret, repoSlug).then(() => {
      resolve();
      event.data.ref.parent.set(null);
    }).catch((error: any) => {
      console.error(`Invalid secure token ${secureToken} ${error}`);
      event.data.ref.parent.set(null);
      reject();
    });
  });
};
