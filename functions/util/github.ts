const request = require('request');

/** Function that sets a Github commit status */
export function setGithubStatus(commitSHA: string,
                                result: boolean,
                                name: string,
                                description: string,
                                url: string,
                                repoSlug: string,
                                token: string) {
  let state = result ? 'success' : 'failure';

  let data = JSON.stringify({
    state: state,
    target_url: url,
    context: name,
    description: description
  });

  let headers =  {
    "Authorization": `token ${token}`,
    "User-Agent": `${name}/1.0`,
    "Content-Type": "application/json"
  };

  return new Promise((resolve) => {
    request({
      url: `https://api.github.com/repos/${repoSlug}/statuses/${commitSHA}`,
      method: 'POST',
      form: data,
      headers: headers
    }, function (error: any, response: any) {
      console.log(response.statusCode);
      resolve(response.statusCode);
    });
  });
};
