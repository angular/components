import {https, config} from 'firebase-functions';
import {verify} from 'jsonwebtoken';
import {setGithubStatus} from './github-status';

/** The repo slug. This is used to validate the JWT is sent from correct repo. */
const repoSlug = config().repoSlug;

/** API token for the Github repository. Required to set the github status on commits and PRs. */
const repoToken = config().repoToken;

/** The JWT secret. This is used to validate JWT. */
const jwtSecret = config().jwtSecret;

export const payloadGithubStatus = https.onRequest(async (request, response) => {
  const authToken = request.header('auth-token');
  const commitSha = request.header('commit-sha');
  const payloadDiff = parseInt(request.header('commit-payload-diff'));

  if (!verifyToken(authToken)) {
    return response.status(403).json({message: 'Auth token is not valid'});
  }

  if (!commitSha) {
    return response.status(404).json({message: 'No commit has been specified'});
  }

  if (!payloadDiff || isNaN(payloadDiff)) {
    return response.status(400).json({message: 'No valid payload diff has been specified.'});
  }

  await setGithubStatus(commitSha, repoToken, {
    result: true,
    name: 'Library Payload',
    url: `https://travis-ci.org/angular/material2/jobs/${process.env['TRAVIS_JOB_ID']}`,
    description: `${payloadDiff > 0 ? `+` : ''} ${payloadDiff.toFixed(2)}KB`
  });

  response.json({message: 'Payload Github status successfully set.'});
});

function verifyToken(token: string): boolean {
  try {
    const tokenPayload = verify(token, jwtSecret, {issuer: 'Travis CI, GmbH'});
    if (tokenPayload.slug !== repoSlug) {
      console.log(`JWT slugs are not matching. Expected ${repoSlug}`);
    }
    return true;
  } catch (e) {
    return false;
  }
}
